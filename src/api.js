/* global window */
const { create } = require('apisauce');
const jwt = require('jsonwebtoken');
const { API_URL, CONNECT_URL } = require('./constants');
const createResources = require('./resources');
const { isBrowser, isNode, isReactNative } = require('./utils');

class API {
  constructor(config) {
    this.config = { ...config };
    this.config.baseURL = this.config.baseURL || API_URL;
    this.config.connectURL = this.config.connectURL || CONNECT_URL;

    const {
      clientId,
      secret,
    } = this.config;

    this.isBrowser = isBrowser();
    this.isNode = isNode();
    this.isReactNative = isReactNative();
    this.isClient = this.isBrowser || this.isReactNative;
    this._token = {};

    // TODO add an error code for each SDK error
    if (!clientId || typeof clientId !== 'string') {
      throw new Error('Please provide a valid Vezgo clientId.');
    }

    if (this.isNode && (!secret || typeof secret !== 'string')) {
      throw new Error('Please provide a valid Vezgo secret.');
    }

    if (this.isBrowser) {
      const auth = config.auth || {};
      this.config.authEndpoint = this.config.authEndpoint || '/vezgo/auth';
      this.config.auth = {
        params: auth.params || {},
        headers: auth.headers || {},
      };
      this.authApi = create({ headers: this.config.auth.headers });
    }
  }

  init() {
    const { loginName, baseURL } = this.config;

    // Data & token endpoints do not require authentication
    this.api = create({ baseURL });

    const dataResources = createResources(this, ['providers', 'teams']);
    Object.assign(this, dataResources);

    if (loginName) return this.login(loginName);

    return this;
  }

  login(loginName) {
    if (this.isNode && (!loginName || typeof loginName !== 'string')) {
      throw new Error('Please provide a valid loginName.');
    }

    const { baseURL } = this.config;

    // Create new user instance, without loginName so it does not recursively loop on init
    const user = new API({ ...this.config, loginName: null });
    user.init();

    // Initiate user api & resource helpers
    user.userApi = create({ baseURL });
    user.userApi.addAsyncRequestTransform(async (request) => {
      // Set token (guaranteed to have > 10 secs left) to Authorization header
      request.headers.Authorization = `Bearer ${await user.getToken()}`;

      return request;
    });

    const userResources = createResources(user, ['accounts', 'transactions']);
    Object.assign(user, userResources);

    user.config.loginName = loginName;

    return user;
  }

  async fetchToken() {
    const response = await (this.isClient ? this.fetchTokenClient() : this.fetchTokenNode());

    if (!response.ok) {
      // TODO process error before throwing
      throw response.originalError;
    }

    const { token } = response.data;
    const payload = jwt.decode(token);
    this._token = { token, payload };

    return this._token.token;
  }

  fetchTokenNode() {
    const {
      clientId,
      secret,
      loginName,
    } = this.config;

    return this.api.post(
      '/auth/token',
      { clientId, secret },
      { headers: { loginName } },
    );
  }

  fetchTokenClient() {
    const { auth, authEndpoint, authorizer } = this.config;
    const { params } = auth;

    if (typeof authorizer === 'function') {
      return new Promise((resolve, reject) => {
        authorizer((error, result) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(result); // expected result = { token: 'the token' }
        });
      });
    }

    return this.authApi.post(authEndpoint, params);
  }

  async getToken(options = {}) {
    // Get a new token if the old one has < minimumLifetime left
    const currentTime = new Date().valueOf();
    const { payload } = this._token;
    let { token } = this._token;

    if (!payload || currentTime > (payload.exp - (options.minimumLifetime || 10)) * 1000) {
      token = await this.fetchToken();
    }

    return token;
  }

  getTeam() {
    return this.teams.info();
  }

  async getConnectUrl(options = {}) {
    const {
      provider,
      state,
      origin = this.isBrowser ? window.location.host : undefined,
      lang,
      redirectURI = this.config.redirectURI,
    } = options;
    const { clientId, connectURL } = this.config;

    if (!origin) throw new Error('Please provide an origin.');

    // Get a token with at least 10 minutes left
    const token = await this.getToken({ minimumLifetime: 600 });

    const query = {
      client_id: clientId,
      redirect_uri: redirectURI,
      state,
      token,
      lang: ['en', 'fr'].includes(lang) ? lang : 'en',
      origin,
    };

    // Cleanup blank params
    Object.keys(query).forEach((key) => (
      [undefined, null, ''].includes(query[key]) && delete query[key]
    ));
    const queryString = new URLSearchParams(query).toString();

    const url = provider ? `${connectURL}/connect/${provider}` : `${connectURL}/connect`;

    return `${url}?${queryString}`;
  }
}

module.exports = API;
