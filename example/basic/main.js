// Initialize variables
let user;
let vezgo;
let accountId;

// Print result on screen
function printResult(results) {
  document
    .getElementById('result')
    .appendChild(renderjson.set_icons('+', '-').set_show_to_level(2)(results));
}

// Get selected account's ID
function getSelectedAccountId() {
  return $('#account_id_mod').val();
}

// Function to handle user login
function login() {
  vezgo = Vezgo.init({
    connectURL: constants.VEZGO_CONNECT_URL,
    clientId: constants.VEZGO_CLIENT_ID,
    baseURL: constants.VEZGO_API_URL || 'https://api.vezgo.com/v1',
    authEndpoint: '/vezgo/auth',
    auth: {
      headers: { Authorization: `Bearer ${$('#username').val()}` },
    },
    // To enable "Demo" provider
    demo: true,
  });
  $('#result').html('');
  $('#response_heading').html('Loading... ');
  user = vezgo.login();
}

// Document ready event
$(document).ready(() => {
  // Connect button click handler
  $('#connect').click(() => {
    $('#connection_error strong').text('');
    login();
    const multiWallet = window.location.search.includes('multi_wallet=true');

    user.connect({
      // provider: 'binance',
      // providers: ['metamask', 'demo', 'coinbase'],
      // disabledProviders: ['binance', 'metamask'],
      theme: constants.VEZGO_CLIENT_THEME,
      providersPerLine: constants.VEZGO_CLIENT_PROVIDERS_PER_LINE,
      // providerCategories: ['exchanges', 'wallets'],
      // hideWalletConnectWallets: true,

      // Enable from the query param flag multi_wallet=true
      multiWallet,

      // For DEV goals
      connectionType: constants.VEZGO_CONNECT_TYPE,
    })
      .onEvent((event, data) => {
        console.log('event', event, data);
      })
      .onConnection((account) => {
        let accounts;
        let message;

        if (multiWallet) {
          accounts = account.accounts;
          // eslint-disable-next-line no-param-reassign
          message = account.message;
        }

        if (multiWallet) {
          console.log('connection result', account);

          const rows = accounts.map((acc, key) => `<tr><td>${key + 1}</td><td>${acc.account || '-'}</td><td>${acc.wallet || '-'} ${acc.network ? `(${acc.network})` : ''}</td><td>${acc.message}</td></tr>`).join('');

          $('#response_heading').html(message);
          const head = '<thead><tr><th><strong>№</strong></th><th><strong>Account ID</strong></th><th><strong>Wallet</strong></th><th><strong>Status</strong></th></tr></thead>';

          $('#result').html(`<table class="table border">${head}<tbody>${rows}</tbody></table>`);
        } else {
          console.log('connection success', account);
          $('#response_heading').html(`Account connected successfully with ID: ${account}`);
        }

        $('#account_id_mod').val(accounts);
      })
      .onError((error) => {
        console.log('connection error', error);
        $('#response_heading').html(`Error connecting account: ${JSON.stringify(error)}`);
        $('#connection_error strong').text(error.message);
      });
  });

  // Reconnect button click handler
  $('#reconnect').click(() => {
    const accountId = getSelectedAccountId();
    if (!accountId) {
      alert('Must enter an Account ID first.');
      return;
    }
    $('#connection_error strong').text('');
    login();

    user
      .reconnect(accountId, {
        theme: constants.VEZGO_CLIENT_THEME,
        providersPerLine: constants.VEZGO_CLIENT_PROVIDERS_PER_LINE,
        connectionType: constants.VEZGO_CONNECT_TYPE,
      })
      .onEvent((event, data) => {
        console.log('event', event, data);
      })
      .onConnection((account) => {
        console.log('reconnection success', account);
        $('#response_heading').html(`Account reconnected successfully with ID: ${account}`);
        $('#account_id_mod').val(account);
      })
      .onError((error) => {
        console.log('reconnection error', error);
        $('#response_heading').html(`Error reconnecting account: ${JSON.stringify(error)}`);
        $('#connection_error strong').text(error.message);
      });
  });

  // Get all accounts button click handler
  $('#get_accounts').click(async () => {
    login();

    try {
      // Get all connected account
      const accounts = await user.accounts.getList();
      $('#response_heading').html('All accounts list of user:');
      printResult(accounts);
    } catch (err) {
      $('#response_heading').html('');
      $('#result').html(`Error:<br><code>${err}</code>`);
    }
  });

  // Account info button click handler
  $('#get_account').click(async () => {
    accountId = getSelectedAccountId();
    if (!accountId) {
      alert('Must enter an Account ID first.');
      return;
    }
    login();

    try {
      // Get account's info by providing accountId
      const account = await user.accounts.getOne(accountId);
      $('#response_heading').html(`Information for account with ID: ${accountId}`);
      printResult(account);
    } catch (err) {
      $('#response_heading').html('');
      $('#result').html(`Error:<br><code>${err}</code>`);
    }
  });

  // Get transactions button click handler
  $('#get_transactions').click(async () => {
    const accountId = getSelectedAccountId();
    if (!accountId) {
      alert('Must connect an account first');
      return;
    }
    login();

    try {
      const transactions = [];
      const from = '2012-01-01';
      let last = '';
      const limit = 50;

      while (true) {
        // Getting all transactions by accountId
        const page = await user.transactions.getList({
          accountId, from, last, limit,
        });

        if (!page.length) break;

        transactions.push(...page);
        // Printing transaction incrementally...
        printResult(transactions);
        last = page[page.length - 1].id;
      }

      $('#response_heading').html(`Transactions for account with ID: ${accountId}`);
      if (transactions.length == 0) {
        $('#result').html('No Transactions found!');
      }
    } catch (err) {
      $('#response_heading').html('');
      $('#result').html(`Error:<br><code>${err}</code>`);
    }
  });

  // Sync account button click handler
  $('#sync_account').click(async () => {
    accountId = getSelectedAccountId();
    if (!accountId) {
      alert('Must enter an Account ID first.');
      return;
    }
    login();

    try {
      // Sync account by  accountId
      await user.accounts.sync(accountId);
      $('#response_heading').html(`Sync requested for ID: ${accountId}`);
    } catch (err) {
      $('#response_heading').html('');
      $('#result').html(`Error:<br><code>${err}</code>`);
    }
  });

  // Remove account button click handler
  $('#remove_account').click(async () => {
    accountId = getSelectedAccountId();
    if (!accountId) {
      alert('Must enter an Account ID first.');
      return;
    }
    login();

    try {
      // Remove account by  accountId
      await user.accounts.remove(accountId);
      $('#response_heading').html(`Removed account for ID: ${accountId}`);
    } catch (err) {
      $('#response_heading').html('');
      $('#result').html(`Error:<br><code>${err}</code>`);
    }
  });
});
