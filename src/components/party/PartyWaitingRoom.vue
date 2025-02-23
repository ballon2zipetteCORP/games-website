<template>
  <div class="section">
    <button @click="leave" class="leave">
      <mdicon name="logout" />
      <span>{{ $t('waitingRoom.leave') }}</span>
    </button>
    <h4 class="code" @click="copyCode">Code: {{ party!.id }}</h4>
    <h1>{{ $t('waitingRoom.title') }}</h1>
    <h2><span>{{ party!.game.displayName }}</span></h2>

    <template v-if="isMeOwner">
      <div class="party-settings">
        <keep-alive>
          <settings-component />
        </keep-alive>
      </div>
    </template>

    <h3 class="players-title">{{ $t('waitingRoom.players') }} ({{ party!.players.length }})</h3>
    <ul class="players">
      <li v-for="player in party!.players" :key="player.id">
        <img :alt="player.displayName + ' profile picture'" src="/images/default-picture.jpg" />
        <h4>{{ player.displayName }} <span v-if="player.id === me!.id" class="me">{{ $t('waitingRoom.me') }}</span></h4>
      </li>
    </ul>
  </div>

  <button v-if="isMeOwner" class="start-game-btn" :disabled="isDisabled" @click="useParty().startGame(party!.id)">
    {{ $t('waitingRoom.startGame') }}
  </button>
</template>

<script lang="ts" setup>

import {storeToRefs} from "pinia";
import {useConnectedPartyStore} from "@/stores/useConnectedPartyStore.ts";
import {useIdentityStore} from "@/stores/useIdentityStore.ts";
import {computed} from "vue";

import WerewolfSettings from "@/components/party/games/werewolf/WerewolfSettings.vue";
import useParty from "@/composables/useParty.ts";
import {useRouter} from "vue-router";

const {party} = storeToRefs(useConnectedPartyStore());
const {me} = storeToRefs(useIdentityStore());

const router = useRouter();

const isMeOwner = computed(() => party.value?.owner.id === me.value?.id);
const isDisabled = computed(() => (party.value?.players?.length ?? 0) < (party.value?.game?.minPlayers ?? 0));

const SettingsComponent = computed(() => {
  if(party.value?.game?.id === "werewolf") {
    return WerewolfSettings;
  }
  return null;
});

const leave = async () => {
  await useParty().leave(party.value?.id!);
  await router.push({ name: 'home' });
}

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(party.value?.id!);
  } catch(e) {
    const error = e as Error;
    console.error(error.message);
  }
}

</script>

<style lang="scss" scoped>
@use "@/scss/components/party/party-waiting-room.scss" as *;
</style>