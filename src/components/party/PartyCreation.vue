<template>
  <div class="container">
    <router-link class="back-btn" :to="{name:'home'}">
      <mdicon name="arrow-left" />
      <span>{{ $t('newGame.back') }}</span>
    </router-link>
    <h1>{{ $t('newGame.title') }}</h1>

    <template v-if="games">
      <ul v-for="game in games" :key="game.id">
        <li :class="{'active': isSelected(game)}">
          <span>{{ game.displayName }}</span>
          <button @click="() => select(game)" :class="{'active': isSelected(game)}" class="primary">
            {{ $t(`newGame.gameSelected.${!isSelected(game) ? 'choose' : 'active'}`) }}
          </button>
        </li>
      </ul>

      <button @click="createParty" class="primary">
        {{ $t('newGame.create') }}
      </button>
    </template>
    <loading-spinner v-else />
  </div>
</template>

<script lang="ts" setup>
import {onMounted, ref} from "vue";
import {useRouter} from "vue-router";

import useGames, {type IGame, type TGames} from "@/composables/useGames.ts";
import LoadingSpinner from "@/components/ui/LoadingSpinner.vue";

const games = ref<TGames>([]);
const selectedGame = ref<IGame|null>(null);

const router = useRouter();

const isSelected = (expected: IGame) => {
  return expected.id === selectedGame.value?.id;
}

const select = (game: IGame) => {
  selectedGame.value = game;
}

const createParty = async () => {
  const game = selectedGame.value;
  const { id } = await useGames().create(game!.id);
  await router.push({
    name: 'party',
    params: { id }
  });
}

onMounted(async () => {
  games.value = await useGames().getAll();
  selectedGame.value = games.value[0];
});
</script>

<style lang="scss" scoped>
@use "@/scss/components/party/party-creation" as *;
</style>