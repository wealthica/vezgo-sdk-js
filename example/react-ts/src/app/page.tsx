"use client";

import { useEffect, useState } from "react";
import { Account, APIUserInterface, Transaction } from "vezgo-sdk-js";

// For local development
// import { Account, APIUserInterface, Transaction } from "../../../../dist/vezgo.es";

import Modal from "./components/Modal";
import JsonView from "react18-json-view";
import "react18-json-view/src/style.css";
import { vezgoInit } from "@/lib/utils";

export default function HomePage() {
  const [user, setUser] = useState<APIUserInterface>();
  const [username, setUsername] = useState("");
  const [accountId, setAccountId] = useState("");
  const [responseHeading, setResponseHeading] = useState("");
  const [responseBody, setResponseBody] = useState<Account[] | Account | Transaction[]>();
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleConnect = async () => {
    clearContent();
    const multiWallet = window.location.search.includes("multi_wallet=true");

    user
      ?.connect({
        // provider: 'binance',
        // providers: ['metamask', 'demo', 'coinbase'],
        // disabledProviders: ['binance', 'metamask'],
        theme: process.env.NEXT_PUBLIC_VEZGO_CLIENT_THEME,
        providersPerLine: process.env.NEXT_PUBLIC_VEZGO_CLIENT_PROVIDERS_PER_LINE || "",
        // providerCategories: ['exchanges', 'wallets'],
        // hideWalletConnectWallets: true,

        // Enable from the query param flag multi_wallet=true
        multiWallet,

        // For DEV goals
        connectionType: process.env.NEXT_PUBLIC_VEZGO_CONNECT_TYPE,
      })
      .onEvent((event: any, data: any) => {
        console.log("event", event, data);
      })
      .onConnection((account: any) => {
        let accounts;
        let message;

        if (multiWallet) {
          accounts = account.accounts;
          message = account.message;
        }

        if (multiWallet) {
          console.log("connection result", account);

          const rows = accounts
            .map(
              (acc: any, key: number) =>
                `<tr><td>${key + 1}</td><td>${acc.account || "-"}</td><td>${acc.wallet || "-"} ${
                  acc.network ? `(${acc.network})` : ""
                }</td><td>${acc.message}</td></tr>`
            )
            .join("");
          const head =
            "<thead><tr><th><strong>№</strong></th><th><strong>Account ID</strong></th><th><strong>Wallet</strong></th><th><strong>Status</strong></th></tr></thead>";

          setResponseHeading(
            `<p>${message}</p><table class="table border">${head}<tbody>${rows}</tbody></table>`
          );
        } else {
          console.log("connection success", account, accounts, message, "aam");
          setResponseHeading(`Account connected successfully with ID: <b>${account}</b>`);
        }

        setAccountId(accounts);
      })
      .onError((error: any) => {
        setResponseHeading("");
        console.log("connection error", error);
        setError(`Error connecting account: ${JSON.stringify(error)}`);
      });
  };

  const handleReconnect = async () => {
    if (!accountId) {
      alert("Must enter an Account ID first.");
      return;
    }
    clearContent();
    user
      ?.reconnect(accountId, {
        theme: process.env.NEXT_PUBLIC_VEZGO_CLIENT_THEME,
        providersPerLine: process.env.NEXT_PUBLIC_VEZGO_CLIENT_PROVIDERS_PER_LINE,
        connectionType: process.env.NEXT_PUBLIC_VEZGO_CONNECT_TYPE,
      })
      .onEvent((event: any, data: any) => {
        console.log("event", event, data);
      })
      .onConnection((account: any) => {
        console.log("reconnection success", account);
        setResponseHeading(`Account reconnected successfully with ID: ${account}`);
        setAccountId(account);
      })
      .onError((error: any) => {
        setResponseHeading("");
        console.log("reconnection error", error);
        setError(`Error reconnecting account: ${JSON.stringify(error)}`);
      });
  };

  const handleGetAccounts = async () => {
    clearContent();
    try {
      // Get all connected account
      const accounts = await user?.accounts.getList();
      setResponseHeading("All accounts list of user:");
      setResponseBody(accounts);
    } catch (err) {
      setResponseHeading("");
      setError(`Error:<br><code>${err}</code>`);
    }
  };

  const handleGetAccount = async () => {
    clearContent();
    if (!accountId) {
      alert("Must enter an Account ID first.");
      return;
    }
    try {
      // Get all connected account
      const account = await user?.accounts.getOne(accountId);
      setResponseHeading(`Account with id: ${accountId}`);
      setResponseBody(account);
    } catch (err) {
      setResponseHeading("");
      setError(`Error:<br><code>${err}</code>`);
    }
  };

  const handleGetTxns = async () => {
    clearContent();
    if (!accountId) {
      alert("Must enter an Account ID first.");
      return;
    }

    try {
      const transactions = [];
      const from = "2012-01-01";
      let last: string | undefined = "";
      const limit = 50;

      while (true) {
        // Getting all transactions by accountId
        const page: Transaction[] | undefined = await user?.transactions.getList({
          accountId,
          from,
          last,
          limit,
        });

        if (!page?.length) break;

        transactions.push(...page);
        // Printing transaction incrementally...
        setResponseBody(transactions);
        last = page[page.length - 1].id;
      }

      setResponseHeading(`Transactions for account with ID: ${accountId}`);
      if (transactions.length == 0) {
        setResponseHeading("No Transactions found!");
      }
    } catch (err) {
      setResponseHeading("");
      setError(`Error:<br><code>${err}</code>`);
    }
  };

  const handleSyncAccount = async () => {
    clearContent();
    if (!accountId) {
      alert("Must enter an Account ID first.");
      return;
    }
    try {
      // Sync account by  accountId
      await user?.accounts.sync(accountId);
      setResponseHeading(`Sync requested for ID: ${accountId}`);
    } catch (err) {
      setResponseHeading("");
      setError(`Error:<br><code>${err}</code>`);
    }
  };

  const handleRemoveAccount = async () => {
    clearContent();
    if (!accountId) {
      alert("Must enter an Account ID first.");
      return;
    }
    try {
      // Remove account by  accountId
      await user?.accounts.remove(accountId);
      setResponseHeading(`Removed account for ID: ${accountId}`);
    } catch (err) {
      setResponseHeading("");
      setError(`Error:<br><code>${err}</code>`);
    }
  };

  // HELPERS
  const clearContent = () => {
    setResponseHeading("Loading...");
    setResponseBody(undefined);
    setError("");
    setShowModal(false);
  };

  // login and set user on first load
  useEffect(() => {
    const vezgo = vezgoInit(username);
    const user = vezgo.login();
    setUser(user as any);
  }, []);

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <h1 className="mb-4 text-center">Vezgo Example App with React/TS/Next</h1>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">
            Login Name:
          </label>
          <input
            type="text"
            id="username"
            className="form-control"
            placeholder="Enter user's unique identification (e.g., email)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="mb-3 d-grid gap-2">
          <button className="btn btn-primary" onClick={handleConnect}>
            Connect
          </button>
        </div>

        <div className="mb-3 d-grid gap-2">
          <button className="btn btn-primary" onClick={handleReconnect}>
            Reconnect
          </button>
        </div>

        <div className="d-flex justify-content-evenly mb-6">
          <button
            id="get_accounts"
            className="btn btn-info backgroud-blue"
            onClick={handleGetAccounts}
          >
            Get All Accounts List
          </button>
          <button
            className="btn btn-info backgroud-blue"
            onClick={() => {
              setShowModal(true);
            }}
          >
            Get Specific Account Info
          </button>
        </div>
        {error && <div className="text-danger">{error}</div>}
        {responseHeading && (
          <div className="mt-4 text-center" dangerouslySetInnerHTML={{ __html: responseHeading }} />
        )}
        {responseBody && (
          <div
            style={{
              background: "#F2F2F2",
              borderRadius: "0.5rem",
              padding: "0.5rem",
            }}
          >
            <JsonView src={responseBody} collapsed={2} />
          </div>
        )}
        {showModal && (
          <Modal
            accountId={accountId}
            setAccountId={setAccountId}
            setShowModal={setShowModal}
            handleGetAccount={handleGetAccount}
            handleGetTxns={handleGetTxns}
            handleSyncAccount={handleSyncAccount}
            handleRemoveAccount={handleRemoveAccount}
          />
        )}
      </div>
    </div>
  );
}
