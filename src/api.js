/* global window */
const { create } = require('apisauce');
const jwt = require('jsonwebtoken');
const { API_URL, CONNECT_URL } = require('./constants');
const createResources = require('./resources');
const {
  isBrowser,
  isNode,
  isReactNative,
  appendIframe,
} = require('./utils');

const CONNECTION_SUCCESS = 'CONNECTION_SUCCESS';
const CONNECTION_FAILURE = 'CONNECTION_FAILURE';

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

    this._token = {};
    this._onConnectorMessage = this._onMessage.bind(this, 'connector');
    this._isConnecting = false;
    this._isWaitingForConnector = false;
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

  connect(options = {}) {
    this._connect(options);

    return this; // return the instance so we can chain the callbacks
  }

  onConnection(callback) {
    if (typeof callback !== 'function') throw new Error('Callback must be a function.');
    this._onConnection = callback.bind(this);

    return this;
  }

  onError(callback) {
    if (typeof callback !== 'function') throw new Error('Callback must be a function.');
    this._onError = callback.bind(this);

    return this;
  }

  onEvent(callback) {
    if (typeof callback !== 'function') throw new Error('Callback must be a function.');
    this._onEvent = callback.bind(this);

    return this;
  }

  async _connect(options = {}) {
    try {
      this._isConnecting = true;
      const { provider } = options;
      const url = await this.getConnectUrl({ provider });

      this.iframe = appendIframe('vezgo-connect-widget');
      this.connector = window.open(url, this.iframe.name);
      this.connector.focus();

      this._isWaitingForConnector = true;
      this._watchConnector();
    } catch (error) {
      this._triggerCallback(CONNECTION_FAILURE, { error_type: 500, message: 'Connection refused' });
    }
  }

  _onMessage(emitter, { origin, data }) {
    let result = data;
    try {
      result = JSON.parse(data);
    } catch (err) {
      // Do nothing
    }

    if (result.vezgo) {
      if (origin !== this.connectUrl && !(/\.vezgo\./).test(new URL(origin).hostname)) {
        throw new Error(`Unauthorized attempt to call SDK from origin: ${origin}`);
      }

      switch (result.eventName) {
        case 'connectSuccess': {
          if (emitter === 'connector') {
            this._isWaitingForConnector = false;
          }

          if (result.account) {
            // Set accountId to the vezgo instance for zabo compatibility?
          }

          this._triggerCallback(CONNECTION_SUCCESS, result.account);
          break;
        }

        case 'connectError': {
          if (emitter === 'connector') {
            this._isWaitingForConnector = false;
          }

          this._triggerCallback(CONNECTION_FAILURE, result.error);
          break;
        }

        case 'connectClose': {
          this._closeConnector();
          break;
        }

        default: {
          if (this._onEvent) {
            // List of zabo events for compatibility https://zabo.com/docs/#zabo-connect-callbacks
            this._onEvent(result.eventName, result.metadata || {});
          }
        }
      }
    }
  }

  _watchConnector() {
    this._setListeners();

    // Connector timeout (10 minutes). This is the absolute max timeout for the connector
    const connectorTimeout = setTimeout(() => {
      this._closeConnector();
      this._triggerCallback(CONNECTION_FAILURE, { error_type: 400, message: 'Connection timeout' });
    }, 10 * 60 * 1000);

    // Watch interval. This watches for connector status (whether closed by user or successfully
    // finished) to clean it up.
    const watchInterval = setInterval(() => {
      if (this._isWaitingForConnector) {
        if (this.connector.closed) {
          this._closeConnector(); // Ensure that the connector has been destroyed
          this._triggerCallback(CONNECTION_FAILURE, { error_type: 400, message: 'Connection closed' });
        }
      } else {
        this._removeListeners();
        clearInterval(watchInterval);
        clearTimeout(connectorTimeout);

        this._closeConnector();
      }
    }, 1000);
  }

  _closeConnector() {
    this._isWaitingForConnector = false;

    if (!this.connector.closed) {
      this.connector.close();
    }

    if (this.iframe) {
      this.iframe.style.display = 'none';
      this.iframe.src = '';
    }
  }

  _triggerCallback(type, data) {
    if (this._isConnecting) {
      this._isConnecting = false;

      if (type === CONNECTION_SUCCESS && this._onConnection) {
        this._onConnection(data);
      }

      if (type === CONNECTION_FAILURE && this._onError) {
        this._onError(data);
      }
    }
  }

  _setListeners() {
    // Listen to postMessage (iframe/browser flow)
    window.addEventListener('message', this._onConnectorMessage, false);
  }

  _removeListeners() {
    window.removeEventListener('message', this._onConnectorMessage, false);
  }
}

module.exports = API;
