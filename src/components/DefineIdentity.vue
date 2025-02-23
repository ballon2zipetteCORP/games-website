<template>
  <div>
    <h1>{{ $t('defineIdentity.title') }}</h1>
    <h2>{{ $t('defineIdentity.subtitle') }}</h2>

    <input v-model="displayName" type="text" placeholder="Votre pseudo" />

    <button @click="confirm" class="primary" :disabled="isDisabled">
      {{ $t('defineIdentity.confirm') }}
    </button>
  </div>
</template>

<script setup lang="ts">

import {computed, ref} from "vue";
import {useIdentityStore} from "@/stores/useIdentityStore.ts";

const displayName = ref("");

const isDisabled = computed(() => !displayName.value.trim() || displayName.value.length < 4);

const confirm = async () => {
  if(isDisabled.value) return;
  await useIdentityStore().createIdentity(displayName.value);
}
</script>

<style lang="scss" scoped>
@use "@/scss/utils/variables" as *;

div {
  position: fixed;
  top: 0;
  left: 0;

  width: 100%;
  height: 100vh;

  z-index: 9999;

  background-color: $gray-1;

  display: flex;
  flex-direction: column;
  gap: 1em;

  padding: 0 2em;
  padding-top: 4em;

  &>h1, &>h2 {
    text-align: center;
  }

  &>h2 {
    margin-bottom: 1em;
  }
}
</style>