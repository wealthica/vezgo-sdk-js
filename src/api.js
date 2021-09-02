import { create } from 'apisauce';
import jwt from 'jsonwebtoken';
import { API_URL } from './constants';
import createResources from './resources';

export default class API {
  // eslint-disable-next-line class-methods-use-this
  async init(config) {
    this.config = config;

    const {
      clientId,
      secret,
      loginName,
    } = config;
    const baseURL = config.baseURL || API_URL;

    // TODO add an error code for each SDK error
    if (!clientId || typeof clientId !== 'string') {
      throw new Error('Please provide a valid Vezgo clientId.');
    }

    if (!secret || typeof secret !== 'string') {
      throw new Error('Please provide a valid Vezgo secret.');
    }

    // Data & token endpoints do not require authentication
    this.api = create({ baseURL });
    this.userApi = create({ baseURL });
    this.userApi.addAsyncRequestTransform(async (request) => {
      // Skip if not logged in
      if (!this.config.loginName) return request;

      const { payload } = this.token || {};
      const currentTime = new Date().valueOf();

      // Get a new token 10 secs before the old one expires
      if (!payload || currentTime < (payload.exp + 10) * 1000) {
        this.token = await this.getToken();
      }

      // Set token to Authorization header
      request.headers.Authorization = `Bearer ${this.token.token}`;

      return request;
    });

    const resources = createResources(this);
    Object.assign(this, resources);

    if (loginName) {
      await this.login(loginName);
    }
  }

  async login(loginName) {
    this.config.loginName = loginName;
    this.token = await this.getToken();
  }

  async getToken() {
    const {
      clientId,
      secret,
      loginName,
    } = this.config;

    const response = await this.api.post(
      '/auth/token',
      { clientId, secret },
      { headers: { loginName } },
    );

    if (!response.ok) {
      // TODO process error before throwing
      throw response.originalError;
    }

    const { token } = response.data;
    const payload = jwt.decode(token);

    return { token, payload };
  }

  getTeam() {
    return this.teams.info();
  }
}
