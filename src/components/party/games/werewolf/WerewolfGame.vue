<template>
  <div class="section">
    <div class="middle">
      <div ref="roleRef" @click="reveal" class="role">
        <div v-show="isReveled">
          <img :alt="role?.displayName" :src="role?.image" />
          <h3>{{ role?.displayName }}</h3>

          <p>
            {{ role?.description }}
          </p>
          <h4>{{ $t('games.werewolf.mission') }}</h4>
          <ul>
            <li v-for="action in role?.expectedActions" :key="action">
              {{ action }}
            </li>
          </ul>
        </div>
        <template v-if="!isReveled">
          <img alt="logo" src="/images/logo.png" />
          <h3>{{ $t('games.werewolf.reveal') }}</h3>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, ref} from "vue";
import {type IMessage, useWebsocketStore} from "@/stores/useWebsocketStore.ts";
import {storeToRefs} from "pinia";

const {websocket} = storeToRefs(useWebsocketStore());

interface IRole {
  description: string;
  displayName: string;
  expectedActions: string[];
  id: string;
  image: string;
}

const role = ref<IRole|null>(null);
const isReveled = ref<boolean>(false);
const roleRef = ref<HTMLDivElement|null>(null);

const reveal = () => {
  roleRef.value?.classList.add("reveal");
  setTimeout(() => {
    isReveled.value = true;
  }, .5e3/2);
}

onMounted(() => {

  try {
    role.value = JSON.parse(localStorage.getItem("werewolf:role")!);
  } catch(ignored) {}

  websocket.value?.addEventListener("message", (event) => {
    const msg = event.data;
    try {
      const message = JSON.parse(msg) as IMessage;
      if(message.type === "ROLE_GIVEN") {
        const r = message.data.role;
        role.value = r;
        localStorage.setItem("werewolf:role", JSON.stringify(r));
      }
    } catch(ignored) {}
  });

})
</script>

<style lang="scss" scoped>
@use "@/scss/utils/variables" as *;

div.section {
  position: absolute;
  top: 0;
  left: 0;

  width: 100%;
  height: 100vh;
}
div.middle {
  position: absolute;
  top: 50%;
  left: 50%;

  transform: translate(-50%, -50%);
}

div.role {
  background-color: $primary-2;
  border-radius: 20px;
  padding: 2em 1em;
  width: 21em;

  &.reveal {
    animation: reveal 1s forwards;
  }

  & img {
    width: 15em;
    display: block;
    margin: auto;
  }
  & h3 {
    margin-top: .5em;
    text-align: center;
  }
  & p {
    text-align: center;
    color: $gray-4;
  }
  & h4 {
    margin-top: .5em;
  }
  & ul {
    margin-left: 1em;
    margin-top: .2em;

    list-style: "- ";
  }
}

@keyframes reveal {
  from {
    transform: rotate3d(0, 1, 0, 0deg);
  }
  to {
    transform: rotate3d(0, 1, 0, 360deg);
  }
}
</style>