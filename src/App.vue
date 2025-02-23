<script setup lang="ts">
import { RouterView } from 'vue-router'
import {storeToRefs} from "pinia";
import {useIdentityStore} from "@/stores/useIdentityStore.ts";
import DefineIdentity from "@/components/DefineIdentity.vue";

const {me} = storeToRefs(useIdentityStore());
</script>

<template>
  <define-identity v-if="!me" />
  <main>
    <router-view />
  </main>
</template>