<template>
  <h4>Roles</h4>
  <ul>
    <li v-for="role in party?.game?.roles" :key="role.id">
      <span>{{ role.displayName }}</span>
      <div class="selector">
        <button @click="() => decr(role.id)">-</button>
        <span>{{ settings.NUMBER_OF_PLAYER_PER_ROLE[role.id] }}</span>
        <button @click="() => incr(role.id)">+</button>
      </div>
    </li>
  </ul>
</template>

<script lang="ts" setup>
import useParty from "@/composables/useParty.ts";
import {ref, watch} from "vue";
import {storeToRefs} from "pinia";
import {useConnectedPartyStore} from "@/stores/useConnectedPartyStore.ts";

const {party} = storeToRefs(useConnectedPartyStore());

const decr = (id: string) => {
  settings.value.NUMBER_OF_PLAYER_PER_ROLE[id] > 0
    && settings.value.NUMBER_OF_PLAYER_PER_ROLE[id]--;
}
const incr = (id: string) => {
  settings.value.NUMBER_OF_PLAYER_PER_ROLE[id]++;
}

const settings = ref<any>(!Object.keys(party.value!.settings).length ? {
  NUMBER_OF_PLAYER_PER_ROLE: Object.fromEntries(party.value!.game.roles.map(({id}) => [id, 0]))
} : party.value!.settings);

watch(settings, async value => {
  await useParty().saveSettings(party.value!.id, value);
}, { deep: true });
</script>

<style lang="scss" scoped>
@use "@/scss/utils/variables" as *;

ul {
  display: flex;
  flex-direction: column;
  gap: 1em;

  &>li {
    display: flex;
    justify-content: space-between;
    align-items: center;

    &:not(:last-of-type) {
      border-bottom: 1px solid $primary-400;
      padding-bottom: 1em;
    }

    &>div.selector {
      display: flex;
      align-items: center;
      gap: .5em;

      &>button {
        padding: .5em 1em;
        font-size: .9em;
        border-radius: 10px;
      }
    }
  }
}
</style>