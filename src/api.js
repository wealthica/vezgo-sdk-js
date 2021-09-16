const { create } = require('apisauce');
const jwt = require('jsonwebtoken');
const { API_URL } = require('./constants');
const createResources = require('./resources');
const { isBrowser, isNode } = require('./utils');

class API {
  constructor(config) {
    this.config = { ...config };
    this.config.baseURL = this.config.baseURL || API_URL;

    const {
      clientId,
      secret,
    } = this.config;

    this.isBrowser = isBrowser();
    this.isNode = isNode();

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

  async login(loginName) {
    if (!loginName || typeof loginName !== 'string') {
      throw new Error('Please provide a valid loginName.');
    }

    const { baseURL } = this.config;

    // Create new user instance, without loginName so it does not recursively loop on init
    const user = new API({ ...this.config, loginName: null });
    user.init();

    // Initiate user api & resource helpers
    user.userApi = create({ baseURL });
    user.userApi.addAsyncRequestTransform(async (request) => {
      const { payload } = user._token || {};
      const currentTime = new Date().valueOf();

      // Get a new token 10 secs before the old one expires
      if (!payload || currentTime > (payload.exp + 10) * 1000) {
        await user.fetchToken();
      }

      // Set token to Authorization header
      request.headers.Authorization = `Bearer ${user.getToken()}`;

      return request;
    });

    const userResources = createResources(user, ['accounts', 'transactions']);
    Object.assign(user, userResources);

    user.config.loginName = loginName;
    await user.fetchToken();

    return user;
  }

  async fetchToken() {
    const response = await (this.isBrowser ? this.fetchTokenBrowser() : this.fetchTokenNode());

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

  fetchTokenBrowser() {
    const { auth, authEndpoint, authorizer } = this.config;
    const { params } = auth;

    if (typeof authorizer === 'function') {
      return new Promise((resolve, reject) => {
        authorizer((error, result) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(result); // expect result = { token: 'the token' }
        });
      });
    }

    return this.authApi.post(authEndpoint, params);
  }

  getToken() {
    return this._token ? this._token.token : null;
  }

  getTeam() {
    return this.teams.info();
  }

  getConnectUrl(options = {}) {
    const { provider, state } = options;
    const redirectURI = options.redirectURI || this.config.redirectURI;
    const lang = ['en', 'fr'].includes(options.lang) ? options.lang : 'en';
    const { clientId } = this.config;
    const token = this.getToken();

    if (!redirectURI) throw new Error('Please provide a valid redirectURI.');
    if (!token) throw new Error('Please login the instance.');

    const query = {
      client_id: clientId,
      redirect_uri: redirectURI,
      state,
      token,
      lang,
    };

    Object.keys(query).forEach((key) => query[key] === undefined && delete query[key]);
    const queryString = new URLSearchParams(query).toString();

    const baseConnectURL = provider
      ? `https://connect.vezgo.com/connect/${provider}`
      : 'https://connect.vezgo.com/connect';

    return `${baseConnectURL}?${queryString}`;
  }
}

module.exports = API;
