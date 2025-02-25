<template>
  <template v-if="party">
    <party-waiting-room v-if="[GameStatus.WAITING_FOR_PLAYERS, GameStatus.READY].includes(party.status as GameStatus)" />
    <game-component v-else-if="party.status === GameStatus.IN_PROGRESS" />
    <div v-else>
      {{ $t('waitingRoom.error.title') }}
      <router-link :to="{name: 'home'}">
        {{ $t('waitingRoom.error.backToHome') }}
      </router-link>
    </div>
  </template>
  <loading-spinner v-else />
</template>

<script lang="ts" setup>
import {useRoute} from "vue-router";
import {computed, ref, watch} from "vue";
import {storeToRefs} from "pinia";

import {useConnectedPartyStore} from "@/stores/useConnectedPartyStore.ts";

import LoadingSpinner from "@/components/ui/LoadingSpinner.vue";
import PartyWaitingRoom from "@/components/party/PartyWaitingRoom.vue";
import useParty, {GameStatus} from "@/composables/useParty.ts";
import WerewolfGame from "@/components/party/games/werewolf/WerewolfGame.vue";
import {type IMessage, useWebsocketStore} from "@/stores/useWebsocketStore.ts";

const route = useRoute();

const id = ref(route.params.id as string);
const {party} = storeToRefs(useConnectedPartyStore());
const websocketStore = useWebsocketStore();

const {websocket} = storeToRefs(websocketStore);

const GameComponent = computed(() => {
  if(party.value?.game.id === "werewolf") {
    return WerewolfGame;
  }
})

watch(id, async value => {
  if(value) {
    useConnectedPartyStore().define(await useParty().get(value));
    websocketStore.init();
  }
}, {immediate: true});

watch(websocket, ws => {
  if(!ws) return;
  ws?.addEventListener("message", (event) => {
    const msg = event.data;
    try {
      const message = JSON.parse(msg) as IMessage;

      if(message.type === "PLAYER_JOINED") {
        party.value!.players?.push(message.data.player);
      } else if(message.type === "PLAYER_LEAVED") {
        party.value!.players?.splice(
            party.value!.players.indexOf(message.data.player),
            1
        );
      } else if(message.type === "GAME_STARTED" || message.type === "GAME_ENDED") {
        party.value!.status = message.data.status!;
      }
    } catch(ignored) {}
  });

})
</script>