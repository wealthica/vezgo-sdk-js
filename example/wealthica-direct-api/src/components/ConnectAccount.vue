<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAppStore } from '../store';
import { vezgoApi, wealthicaApi } from '../api';

const store = useAppStore();

const selected = ref('');
const errorMessage = ref('');
const form = ref({});
let pollReplayed;
let hadSecurityAnswer;
let syncError;
let connected;

const selectedProvider = computed(() => {
  if (!selected.value || !store.providers.length) return null;

  return store.providers.find((provider) => provider.name === selected.value);
});

const credentialInputFields = computed(() => {
  if (!selectedProvider.value) return [];
  return selectedProvider.value.credentials.filter(field => field !== "network");
});

const institutionData = computed(() => {
  return {
    name: selectedProvider.value.display_name,
    type: selectedProvider.value.name,
    credentials: form.value,
  };
});

onMounted(() => {
  fetchProviders();
})

async function fetchProviders() {
  try {
    store.loadingCount += 1;
    const response = await wealthicaApi.get('/providers');

    if (!response.ok) {
      errorMessage.value = response.originalError.message;
      return;
    }

    store.providers = response.data;
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    store.loadingCount -= 1;
  }
}

function getLabel(provider, field) {
  // if specific "key" or "secret" label is set (en is a fallback option if it's set)
  const label = provider?.misc?.[field]?.label?.en;

  return label || field;
};

async function connect() {
  errorMessage.value = '';
  let isValid = true;

  credentialInputFields.value.forEach((field) => {
    // Do more advanced validation if provider.misc.[field].pattern exists.
    if (!form.value[field]) isValid = false;
  });

  if (!isValid) {
    errorMessage.value = "Please make sure all fields are valid";
    return;
  }

  errorMessage.value = "Connecting your account...";
  const result = await createInstitution(institutionData.value);

  if (!result._id) return onInstitutionError(institutionData.value, result);

  return updateStateAndPoll({
    institution: response.data,
    hadSecurityAnswer: false,
  });
}

async function createInstitution(institutionData) {
  store.loadingCount += 1;
  const response = await wealthicaApi.post("/institutions", institutionData);
  store.loadingCount -= 1;

  // apisause does not consider 304 to be 'ok', thus the separate check
  if (!response.ok && response.status !== 304) return response;

  store.institution = response.data;

  return response.data;
};

async function updateInstitution(institutionData) {
  store.loadingCount += 1;
  const response = await wealthicaApi.put(`/institutions/${institutionData._id}`, institutionData);
  store.loadingCount -= 1;

  if (!response.ok) return response;

  store.institution = response.data;

  return response.data;
};

async function pollInstitution({ id, v }) {
  store.loadingCount += 1;
  const response = await wealthicaApi.put(`/institutions/${id}/poll`, { v });
  store.loadingCount -= 1;

  // apisause does not consider 304 to be 'ok', thus the separate check
  if (!response.ok && response.status !== 304) return response;

  return response.data;
};

function updateStateAndPoll(options) {
  hadSecurityAnswer = options.hadSecurityAnswer;
  pollReplayed = 0;

  return doPoll(options.institution);
}

async function doPoll(institution, expectedV = institution.__v + 2) {
  // Update loading text on 2nd poll
  if (pollReplayed === 1) {
    errorMessage.value = "This is taking longer than usual";
  }

  const result = await pollInstitution({
    id: institution._id,
    v: expectedV - 1,
  });

  // Reset syncError only when the poll is complete.
  // syncError should be visible while waiting for the response the next poll
  // to prevent resetting the current Security Answer screen.
  syncError = null;

  if (result && !result._id) return onInstitutionError(institution, result);

  // We replay the poll up to 3 times in case of a poll timeout (the server returns only 304
  // status and not any data.
  if (!result) {
    if (pollReplayed >= 3) return onInstitutionTimeout(institution);

    pollReplayed += 1;
    return doPoll(institution, expectedV);
  }

  // If new institution data is returned, check sync_status & show corresponding screen
  switch (result.sync_status) {
    case "error":
      return onInstitutionSyncError(result);
    case "retry":
      return onRetry(result);
    case "ok":
    case "syncing":
      if (hadSecurityAnswer) {
        hadSecurityAnswer = false;

        // Do not wait for investments, return right away when authorized to minimize timeout.
        // If the the worker crashes for some reason when adding, at least the end-client will
        // have the accountId on their end.
        if (result.authorized) return onInstitutionSuccess(result);

        // Since we just need to verify authorized, only need to poll for 1 v bump next.
        return doPoll(result, result.__v + 1);
      }

      return onInstitutionSuccess(result);
    default:
      return null;
  }
};

function onInstitutionError(institution, error) {
  if (institution && institution.sync_status === "error") {
    onInstitutionSyncError(institution);
    return;
  }

  if (error.status === 503 || error.problem === "TIMEOUT_ERROR") {
    onInstitutionTimeout(institution);
    return;
  }

  if (error.status >= 500 || ["CONNECTION_ERROR", "NETWORK_ERROR"].includes(error.problem)) {
    errorMessage.value = 'Connection error';
    store.institution = null;
    return;
  }

  if (error.status === 404) {
    onInvalidCredentialsError();
    return;
  }

  if (error.status === 409) {
    errorMessage.value = "Account can't be connected while syncing. Please try again later.";
    store.institution = null;
    return;
  }

  errorMessage.value = 'Unknown error';
  store.institution = null;
}

function onInvalidCredentialsError() {
  store.institution = null;
  goBackWithError(
    `We couldn't login to ${institutionData.value.name} using the credentials you provided.`
  );
}

function goBackWithError(error) {
  errorMessage.value = error;
  form.value = {};
}

function onInstitutionTimeout(institution) {
  errorMessage.value = 'Connection timeout. Retry.';

  store.institution = null;
}

function onRetry(institution) {
  errorMessage.value = `${institution.sync_error.message}. Retry.`;

  store.institution = null;
}

function onInstitutionSuccess(institution) {
  connected = true;
  store.institution = institution;
}
</script>

<template>
  <div class="connect-account">
    <h3>2. Select provider and connect account</h3>
    <select v-model="selected">
      <option value="" disabled>Select Provider</option>
      <option
        v-for="provider in store.providers"
        :key="provider.name"
        :value="provider.name"
      >
        {{ provider.display_name }}
      </option>
    </select>
    <button @click="fetchProviders" :disabled="store.loadingCount">Refresh List</button>

    <div v-if="selectedProvider">
      <form class="credentials-form" @submit.prevent>
        <input
          v-for="(field, index) in credentialInputFields"
          :key="index"
          class="credentials__input"
          :name="field"
          :placeholder="getLabel(selectedProvider, field)"
          v-model="form[field]"
          :type="['password', 'secret'].includes(field) ? 'password' : 'text'"
          :disabled="store.loadingCount"
          @change="setValue"
        />
        <button @click="connect" :disabled="store.loadingCount">Connect</button>
      </form>
    </div>

    <div v-if="errorMessage"><strong>{{ errorMessage }}</strong></div>
    <br><br>
  </div>
</template>

