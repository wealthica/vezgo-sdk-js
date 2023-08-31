<script setup>
import { ref } from 'vue';
import { useAppStore } from '../store';
import { api } from '../api';

const store = useAppStore();

const errorMessage = ref('');

async function getToken() {
  try {
    errorMessage.value = '';
    store.loadingCount += 1;
    const response = await api.post(
      '/vezgo/token',
      {},
      { headers: { userId: store.userId } },
    );

    if (!response.ok) {
      errorMessage.value = response.originalError.message;
      return;
    }

    store.token = response.data.token;
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    store.loadingCount -= 1;
  }
}
</script>

<template>
  <div class="get-token">
    <h3>1. Get API token for a user</h3>
    <label for="username">Login name (unique User ID from your system):</label>
    <br>
    <input type="text" v-model="store.userId" />
    <button @click="getToken" :disabled="store.loadingCount">Get API Token</button>
    -->
    <input type="text" id="token" placeholder="API Token" v-model="store.token" />
    <br>
    <div v-if="errorMessage">Error: <strong>{{ errorMessage }}</strong></div>
    <br><br>
  </div>
</template>

