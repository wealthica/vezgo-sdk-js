import Vezgo from "vezgo-sdk-js/dist/vezgo.es5";

export const vezgoInit = (username?: string) => {
  const vezgo = Vezgo.init({
    connectURL: process.env.NEXT_PUBLIC_VEZGO_CONNECT_URL,
    clientId: process.env.NEXT_PUBLIC_VEZGO_CLIENT_ID || "",
    baseURL: process.env.VEZGO_API_URL || "https://api.vezgo.com/v1",
    authEndpoint: "/api/vezgo/auth",
    hideWalletConnectWallets: false,
    auth: {
      headers: { Authorization: `Bearer ${username}` },
    },
    // To enable "Demo" provider
    demo: true,
  });
  return vezgo;
};
