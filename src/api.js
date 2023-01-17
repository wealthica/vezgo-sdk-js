/* global window */
const { create } = require('apisauce');
const jwt = require('jsonwebtoken');
const { API_URL, CONNECT_URL } = require('./constants');
const createResources = require('./resources');
const {
  isBrowser,
  isNode,
  isReactNative,
  appendVezgoIframe,
  appendVezgoForm,
} = require('./utils');

const CALLBACK_CONNECTION = '_onConnection';
const CALLBACK_ERROR = '_onError';
const CALLBACK_EVENT = '_onEvent';

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
    this._onWidgetMessage = this._onMessage.bind(this);
    this._widgetOpened = false;
    this._widgetActive = false;
  }

  _init() {
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
    user._init();

    // Initiate user api & resource helpers
    user.userApi = create({ baseURL });
    user.userApi.addAsyncRequestTransform(async (request) => {
      // Set token (guaranteed to have > 10 secs left) to Authorization header
      request.headers.Authorization = `Bearer ${await user.getToken()}`;

      return request;
    });

    const userResources = createResources(user, ['accounts', 'history', 'transactions']);
    Object.assign(user, userResources);

    user.config.loginName = loginName;

    return user;
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

  async fetchToken() {
    const response = await (this.isClient ? this._fetchTokenClient() : this._fetchTokenNode());

    if (!response.ok && !response.token) {
      // TODO process error before throwing
      throw response.originalError;
    }

    const { token } = (response.data || response);
    const payload = jwt.decode(token);
    this._token = { token, payload };

    return this._token.token;
  }

  _fetchTokenNode() {
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

  _fetchTokenClient() {
    const { auth, authEndpoint, authorizer } = this.config;
    const { params } = auth;

    if (typeof authorizer === 'function') {
      return new Promise((resolve, reject) => {
        authorizer((error, result) => {
          if (error) {
            reject(error);
            return;
          }

          if (!result || typeof result !== 'object' || !result.token) {
            reject(new Error('Invalid authorizer result. Expecting `{ token: "the token" }`.'));
            return;
          }

          resolve(result); // expected result = { token: 'the token' }
        });
      });
    }

    return this.authApi.post(authEndpoint, params);
  }

  getTeam() {
    return this.teams.info();
  }

  async getConnectData(options = {}) {
    const {
      provider,
      accountId,
      state,
      origin = this.isBrowser ? window.location.origin : undefined,
      lang,
      redirectURI = this.config.redirectURI,
      syncNfts,
      providers,
      theme,
      providersPerLine,
    } = options;
    const { clientId, connectURL } = this.config;

    // Get a token with at least 10 minutes left
    const token = await this.getToken({ minimumLifetime: 600 });

    const query = {
      client_id: clientId,
      redirect_uri: redirectURI,
      state,
      lang: lang || 'en',
      origin,
      sync_nfts: syncNfts ? true : undefined,
      demo: this.config.demo ? true : undefined,
      // 'provider' param in priority, skip 'providers' param if 'provider' is set
      providers: !provider && Array.isArray(providers) && providers.length ? providers.join(',') : undefined,
      theme: ['light', 'dark'].includes(theme) ? theme : 'light',
      providers_per_line: (providersPerLine && ['1', '2'].includes(providersPerLine.toString())) ? providersPerLine.toString() : '2',
    };

    // Cleanup blank params
    Object.keys(query).forEach((key) => (
      [undefined, null, ''].includes(query[key]) && delete query[key]
    ));
    const queryString = new URLSearchParams(query).toString();

    let url = provider ? `${connectURL}/connect/${provider}` : `${connectURL}/connect`;

    // Return reconnect url if accountId is passed in
    if (accountId) {
      url = `${connectURL}/reconnect/${accountId}`;
    }

    return { url: `${url}?${queryString}`, token };
  }

  connect(options = {}) {
    this._connect(options);

    return this; // return the instance so we can chain the callbacks
  }

  reconnect(accountId) {
    if (!accountId || typeof accountId !== 'string') {
      throw new Error('Please provide a valid accountId.');
    }

    this._connect({ accountId });

    return this; // return the instance so we can chain the callbacks
  }

  onConnection(callback) {
    if (typeof callback !== 'function') throw new Error('Callback must be a function.');
    this[CALLBACK_CONNECTION] = callback.bind(this);

    return this; // chaining support
  }

  onError(callback) {
    if (typeof callback !== 'function') throw new Error('Callback must be a function.');
    this[CALLBACK_ERROR] = callback.bind(this);

    return this; // chaining support
  }

  onEvent(callback) {
    if (typeof callback !== 'function') throw new Error('Callback must be a function.');
    this[CALLBACK_EVENT] = callback.bind(this);

    return this; // chaining support
  }

  _connect(options = {}) {
    if (!this.isBrowser) throw new Error('Only supported in Browser.');

    (async () => {
      try {
        this._widgetOpened = true;
        const {
          provider, providers, accountId, lang, theme, providersPerLine,
        } = options;
        const { url, token } = await this.getConnectData({
          provider, providers, accountId, lang, theme, providersPerLine,
        });

        this.iframe = appendVezgoIframe();

        this.widget = window.open('', this.iframe.name);
        this.form = appendVezgoForm({ url, token, iframe: this.iframe });

        this.form.submit();
        this.widget.focus();

        this._widgetActive = true;
        this._addListeners();
        this._addWatchers();
      } catch (error) {
        this._closeWidgetWithError(500, 'Connection refused');
      }
    })();
  }

  _onMessage({ origin, data }) {
    let result = data;

    try {
      // Try parsing message data as JSON
      result = JSON.parse(data);
    } catch (err) {
      // Do nothing
    }

    // Skip if not a Vezgo message
    if (!result.vezgo) return;

    if (origin !== this.config.connectURL && !(/\.vezgo\.com$/).test(new URL(origin).hostname)) {
      throw new Error(`Calling Vezgo from unauthorized origin ${origin}`);
    }

    switch (result.event) {
      case 'success': {
        // Connection success
        this._triggerCallback(CALLBACK_CONNECTION, result.account);
        break;
      }

      case 'error': {
        // Connection error
        this._triggerCallback(CALLBACK_ERROR, result.error);
        break;
      }

      case 'close': {
        // Widget closed by user action, close right away
        this._closeWidgetWithError(400, 'Connection closed');
        break;
      }

      default: {
        // Other events throughout the connection process
        this._triggerCallback(CALLBACK_EVENT, result);
      }
    }
  }

  _addWatchers() {
    // Watch for widget timeout (10 minutes)
    const timeoutWatcher = setTimeout(() => {
      this._closeWidgetWithError(400, 'Connection timeout');
    }, 10 * 60 * 1000);

    // Watch for widget status (whether closed by user or successfully finished) and clean it up
    const doneWatcher = setInterval(() => {
      if (this._widgetActive) {
        // Handle edge case where widget is closed unexpectedly (by browser extensions, via browser
        // console etc.)
        if (this.widget.closed) {
          this._closeWidgetWithError(400, 'Connection closed');
        }
      } else {
        // If widget is marked as inactive, clear timeout and close it
        this._removeListeners();
        clearInterval(doneWatcher);
        clearTimeout(timeoutWatcher);

        this._closeWidget();
      }
    }, 1000);
  }

  // eslint-disable-next-line camelcase
  _closeWidgetWithError(error_type, message) {
    this._closeWidget();
    this._triggerCallback(CALLBACK_ERROR, { error_type, message });
  }

  _closeWidget() {
    this._widgetActive = false;

    // Close the widget window object
    if (this.widget && !this.widget.closed) {
      this.widget.close();
    }

    // Delete the iframe and form
    if (this.iframe) this.iframe.remove();
    if (this.form) this.form.remove();
  }

  _triggerCallback(callback, payload = {}) {
    // onConnection and onError callbacks are only triggered once per widget session.
    if ([CALLBACK_CONNECTION, CALLBACK_ERROR].includes(callback)) {
      // Mark widget as inactive so it's cleaned up by the doneWatcher.
      this._widgetActive = false;

      if (this._widgetOpened) {
        this._widgetOpened = false;

        if (this[callback]) this[callback](payload);
      }

      return;
    }

    if (callback === CALLBACK_EVENT && this[callback]) {
      this[callback](payload.event, payload.data);
    }
  }

  _addListeners() {
    window.addEventListener('message', this._onWidgetMessage, false);
  }

  _removeListeners() {
    window.removeEventListener('message', this._onWidgetMessage, false);
  }
}

module.exports = API;
