<template>
  <template v-if="party">
    <party-waiting-room v-if="[GameStatus.WAITING_FOR_PLAYERS, GameStatus.READY].includes(party.status as GameStatus)" />
  </template>
  <loading-spinner v-else />
</template>

<script lang="ts" setup>
import {useRoute} from "vue-router";
import {ref, watch} from "vue";
import {storeToRefs} from "pinia";

import {useConnectedPartyStore} from "@/stores/useConnectedPartyStore.ts";

import LoadingSpinner from "@/components/ui/LoadingSpinner.vue";
import PartyWaitingRoom from "@/components/party/PartyWaitingRoom.vue";
import useParty, {GameStatus} from "@/composables/useParty.ts";

const route = useRoute();

const id = ref(route.params.id as string);
const {party} = storeToRefs(useConnectedPartyStore());

watch(id, async value => {
  if(value) {
    useConnectedPartyStore().define(await useParty().get(value));
  }
}, {immediate: true})
</script>