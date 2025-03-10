import type { IParty } from "@/composables/useParty.ts";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useConnectedPartyStore = defineStore("connectedPartyStore", () => {
  const _party = ref<IParty | null>(null);
  const party = computed({
    get: () => _party.value,
    set: (value) => {
      _party.value = { ..._party.value, ...value } as any;
    },
  });

  const define = (val: IParty) => {
    _party.value = val;
  };

  return {
    party,
    define,
  };
});
