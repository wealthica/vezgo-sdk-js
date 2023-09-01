// Initialize variables
let user;
let vezgo;
let accountId;

// Print result on screen
function printResult(results) {
  document
    .getElementById("result")
    .appendChild(renderjson.set_icons("+", "-").set_show_to_level(2)(results));
}

// Get selected account's ID
function getSelectedAccountId() {
  return $("#account_id_mod").val();
}

// Function to handle user login
function login() {
  vezgo = Vezgo.init({
    connectURL: constants.VEZGO_CONNECT_URL,
    clientId: constants.VEZGO_CLIENT_ID,
    authEndpoint: "/vezgo/auth",
    auth: {
      headers: { Authorization: `Bearer ${$("#username").val()}` },
    },
  });
  $("#result").html("");
  $("#response_heading").html(`Loading... `);
  user = vezgo.login();
}

// Document ready event
$(document).ready(function () {
  // Connect button click handler
  $("#connect").click(function () {
    $("#connection_error strong").text("");
    login();

    user
      .connect()
      .onConnection(function (account) {
        console.log("connection success", account);
        $("#response_heading").html(`Account connected successfully with ID: ${account}`);
        $("#account_id_mod").val(account);
      })
      .onError(function (error) {
        console.log("connection error", error);
        $("#response_heading").html(`Error connecting account: ${JSON.stringify(error)}`);
        $("#connection_error strong").text(error.message);
      });
  });

  // Reconnect button click handler
  $("#reconnect").click(function () {
    const accountId = getSelectedAccountId();
    if (!accountId) {
      alert("Must enter an Account ID first.");
      return;
    }
    $("#connection_error strong").text("");
    login();

    user
      .reconnect(accountId)
      .onConnection(function (account) {
        console.log("reconnection success", account);
        $("#response_heading").html(`Account reconnected successfully with ID: ${account}`);
        $("#account_id_mod").val(account);
      })
      .onError(function (error) {
        console.log("reconnection error", error);
        $("#response_heading").html(`Error reconnecting account: ${JSON.stringify(error)}`);
        $("#connection_error strong").text(error.message);
      });
  });

  // Get all accounts button click handler
  $("#get_accounts").click(async function () {
    login();

    try {
      // Get all connected account
      const accounts = await user.accounts.getList();
      $("#response_heading").html(`All accounts list of user:`);
      printResult(accounts);
    } catch (err) {
      $("#response_heading").html("");
      $("#result").html("Error:<br><code>" + err + "</code>");
    }
  });

  // Account info button click handler
  $("#get_account").click(async function () {
    accountId = getSelectedAccountId();
    if (!accountId) {
      alert("Must enter an Account ID first.");
      return;
    }
    login();

    try {
      // Get account's info by providing accountId
      const account = await user.accounts.getOne(accountId);
      $("#response_heading").html(`Information for account with ID: ${accountId}`);
      printResult(account);
    } catch (err) {
      $("#response_heading").html("");
      $("#result").html("Error:<br><code>" + err + "</code>");
    }
  });

  // Get transactions button click handler
  $("#get_transactions").click(async function () {
    const accountId = getSelectedAccountId();
    if (!accountId) {
      alert("Must connect an account first");
      return;
    }
    login();

    try {
      const transactions = [];
      const from = "2012-01-01";
      let last = "";
      const limit = 50;

      while (true) {
        // Getting all transactions by accountId
        const page = await user.transactions.getList({ accountId, from, last, limit });

        if (!page.length) break;

        transactions.push(...page);
        // Printing transaction incrementally...
        printResult(transactions);
        last = page[page.length - 1].id;
      }

      $("#response_heading").html(`Transactions for account with ID: ${accountId}`);
      if(transactions.length == 0){
        $("#result").html("No Transactions found!");

      }
    } catch (err) {
      $("#response_heading").html("");
      $("#result").html("Error:<br><code>" + err + "</code>");
    }
  });

  // Sync account button click handler
  $("#sync_account").click(async function () {
    accountId = getSelectedAccountId();
    if (!accountId) {
      alert("Must enter an Account ID first.");
      return;
    }
    login();

    try {
      // Sync account by  accountId
      await user.accounts.sync(accountId);
      $("#response_heading").html(`Sync requested for ID: ${accountId}`);
    } catch (err) {
      $("#response_heading").html("");
      $("#result").html("Error:<br><code>" + err + "</code>");
    }
  });

  // Remove account button click handler
  $("#remove_account").click(async function () {
    accountId = getSelectedAccountId();
    if (!accountId) {
      alert("Must enter an Account ID first.");
      return;
    }
    login();

    try {
      // Remove account by  accountId
      await user.accounts.remove(accountId);
      $("#response_heading").html(`Removed account for ID: ${accountId}`);
    } catch (err) {
      $("#response_heading").html("");
      $("#result").html("Error:<br><code>" + err + "</code>");
    }
  });
});
