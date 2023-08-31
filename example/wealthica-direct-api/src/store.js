import { ref } from 'vue';
import { defineStore } from 'pinia';

// eslint-disable-next-line import/prefer-default-export
export const useAppStore = defineStore('app', () => {
  const userId = ref('userid_1');
  const token = ref('');
  const loadingCount = ref(0);
  const providers = ref([]);
  const institution = ref({});

  return {
    userId, token, loadingCount, providers, institution,
  };
});
