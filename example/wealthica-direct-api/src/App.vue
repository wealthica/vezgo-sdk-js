<script setup>
import GetToken from './components/GetToken.vue';
import ConnectAccount from './components/ConnectAccount.vue';

import { useAppStore } from './store';

const store = useAppStore();
</script>

<template>
  <div>
    <header>
      <img alt="Vue logo" class="logo" src="./assets/logo.svg" height="30" />
      <h1>Example: Wealthica Direct API</h1>
    </header>

    <main>
      <div v-if="store.errorMessage" id="error">Error: <strong>{{ store.errorMessage }}</strong></div>

      <GetToken />

      <ConnectAccount />

    </main>
  </div>
</template>

<style scoped>
header {
  line-height: 1.5;
  margin-bottom: 30px;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }
}
</style>
