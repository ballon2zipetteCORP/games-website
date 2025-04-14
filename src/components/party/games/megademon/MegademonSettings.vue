<template>
    <h4>Temps pour boire la mégademon</h4>
    <div class="section">
        <div class="selector">
            <button @click="decr">-</button>
            <span>{{ settings.TIME_TO_DRINK }}</span>
            <button @click="incr">+</button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";

import useParty from "@/composables/useParty.ts";
import { useConnectedPartyStore } from "@/stores/useConnectedPartyStore.ts";

const emit = defineEmits(["update"]);
const { party } = storeToRefs(useConnectedPartyStore());


const decr = (id: string) => {
  settings.value.TIME_TO_DRINK > 0 &&
    settings.value.TIME_TO_DRINK--;
};
const incr = (id: string) => {
    settings.value.TIME_TO_DRINK++;
};

const settings = ref<any>({ TIME_TO_DRINK: 20 });
const canStart = ref<boolean>(true);

watch(
  settings,
  async (value) => {
    await useParty().saveSettings(party.value!.id, value);
    if (party.value?.settings) {
      Object.assign(party.value.settings, value);
    }
  },
  { deep: true }
);

onMounted(() => {
  emit("update");
});

defineExpose({
  canStart,
});
</script>

<style lang="scss" scoped>
@use "@/scss/utils/variables" as *;

div.section {
    display: flex;
    align-items: center;
    justify-content: center;
}
h4 {
    margin-bottom: 1em;
    text-align: center;
}
div.selector {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5em;
    width: 100%;
    font-size: 1.8em;

    & > button {
        padding: 0.5em 1em;
        font-size: 0.9em;
        width: fit-content;
        border-radius: 10px;
    }
}
</style>
