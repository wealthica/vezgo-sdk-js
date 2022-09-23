import { ApisauceInstance } from "apisauce";

export = Vezgo

declare var Vezgo: {
  init(config: APIConfig): APIInterface;
};

type APIConfig = {
  clientId: string;
  secret: string;
  baseURL?: string;
  connectURL?: string;
  redirectURI?: string;
  loginName?: string | null;
  demo?: boolean,
  authEndpoint?: string
  auth?: {
    headers?: object;
    params?: object;
  }
}

type TokenOptions = {
  minimumLifetime: number;
}

type ConnectDataOptions = {
  provider: string;
  accountId: string;
  state: string;
  origin: string | undefined;
  lang: string;
  redirectURI: string;
  providers: Array<string> | undefined;
}

type ConnectData = {
  url: string;
  token: string;
}

interface APIInterface {
  constructor(config: APIConfig)
  __init():APIInterface
  login(loginName: string): APIUserInterface
  getToken(options: TokenOptions): Promise<string>
  fetchToken(): Promise<string>
  authApi: ApisauceInstance
  api: ApisauceInstance
  getTeam(): string;
  getConnectData(options: ConnectDataOptions):Promise<ConnectData>
  connect(options?: APIConfig): APIInterface
  reconnect(accountId: string): APIUserInterface
  onConnection(callback: Function): APIInterface
  onError(callback: Function): APIInterface
  onEvent(callback: Function): APIInterface
}

interface APIUserInterface extends APIInterface {
  userApi: ApisauceInstance
}
