<template>
  <div class="container">
    <h1>{{ $t('home.title.0') }} <span>{{ me?.displayName }}</span> {{ $t('home.title.1') }} !</h1>

    <router-link :to="{name: 'new-game'}">
      <button class="primary">
        {{ $t('home.createPartyBtn') }}
      </button>
    </router-link>
    <div class="code-input">
      <input
          v-for="(_, index) in code"
          :key="index"
          type="text"
          maxlength="1"
          v-model="code[index]"
          @input="onInput(index, $event)"
          @keydown.backspace="onBackspace(index, $event)"
          ref="inputRefs"
      />
    </div>
    <button @click="join" class="primary join" :disabled="isDisabled">
      {{ $t('home.joinPartyBtn') }}
    </button>
  </div>
</template>

<script lang="ts" setup>
import {storeToRefs} from "pinia";
import {useIdentityStore} from "@/stores/useIdentityStore.ts";
import {computed, ref} from "vue";
import {useRouter} from "vue-router";
import useParty from "@/composables/useParty.ts";

const {me} = storeToRefs(useIdentityStore());

const router = useRouter();

const code = ref(Array(6).fill(''))
const inputRefs = ref<HTMLInputElement[]>([])
const isDisabled = computed(() => code.value.filter((c) => !c.trim()).length > 0)

const onInput = (index: number, event: Event) => {
  let value = (event.target! as HTMLInputElement).value
  const [first, ...rest] = value
  value = first ?? ''

  const lastInputBox = index === inputRefs.value.length - 1
  const didInsertContent = first !== undefined

  if (didInsertContent && !lastInputBox) {
    inputRefs.value[index + 1].focus()
    inputRefs.value[index + 1].value = rest.join('')
    inputRefs.value[index + 1].dispatchEvent(new Event('input'))
  }
}

const onBackspace = (index: number, event: Event) => {
  const value = (event.target! as HTMLInputElement).value
  if (value === '') {
    inputRefs.value[Math.max(0, index - 1)]?.focus()
  }
}

const join = async () => {
  if (isDisabled.value) return
  const partyId = code.value.join('').trim().toUpperCase()

  await useParty().join(partyId);
  await router.push({
    name: 'party',
    params: { id: partyId },
  })
}
</script>

<style lang="scss" scoped>
@import "@/scss/components/home-page.scss";
</style>