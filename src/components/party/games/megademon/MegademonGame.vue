<template>
  <div class="middle">
    <div v-if="hideWheel || !!playerChosen">
      <h2 class="title">Bon courage {{ playerChosen }}</h2>
      <img
        :style="{'animation-duration': duration}"
        alt="mg-1" 
        :src="`https://s3.matteogaillard.fr/api/v1/buckets/zipette-games/objects/download?preview=true&prefix=megademon%2F${currentState}.png`" 
      />
      <h3>Temps restant: {{ timeRestToDrink }}</h3>
    </div>

    <div class="wheel-container" v-else>
      <h2 class="title-2">La roue de la soif</h2>
      <h3>Qui va se régaler ?</h3>
      <div class="pointer"></div>
      <canvas ref="wheelRef" id="wheel" width="280" height="280" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useConnectedPartyStore } from "@/stores/useConnectedPartyStore";
import { useWebsocketStore, type IMessage } from "@/stores/useWebsocketStore";
import { storeToRefs } from "pinia";
import {computed, ref, onMounted} from "vue";
import gsap from "gsap";

const STATE = {
    STATE_1: "mg_1",
    STATE_2: "mg_2",
    STATE_3: "mg_3",
    STATE_4: "mg_4"
}

const {websocket} = storeToRefs(useWebsocketStore());
const {party} = storeToRefs(useConnectedPartyStore());

const now = ref<number>(Date.now());
const timeToDrink = ref<number>(Date.now());

const wheelRef = ref<HTMLCanvasElement|undefined>(undefined);
const playerChosen = ref<string>("");

const players = computed(() => {
  return party.value?.players?.map(p => p.displayName) ?? [];
})

const hideWheel = ref<boolean>(false);

const timeDiff = computed<Date>(() => {
  if (timeToDrink.value) {
    return new Date(timeToDrink.value - now.value);
  }
  return new Date();
})
const timeRestToDrink = computed(() => {
    const _format = (n: number) => n.toString().padStart(2, "0");
    const diff = timeDiff.value;
    return `${_format(diff.getMinutes())}:${_format(diff.getSeconds())}`;
})

const duration = computed(() => {
  const minutes = timeDiff.value.getMinutes();
  const timeToDrink = (party.value!.settings?.TIME_TO_DRINK ?? party.value!.game?.defaultTimeToDrink ?? 20) as number;
  const percentage = (minutes / timeToDrink) * 100;
  let duration = null;

  if (percentage >= 80) {
    duration = "1.3";
  } else if (percentage >= 60) {
    duration = "1";
  } else if (percentage >= 40) {
    duration = ".5";
  } else {
    duration = ".2";
  }

  return duration + "s";
})
const currentState = computed(() => {
  const minutes = timeDiff.value.getMinutes();
  const timeToDrink = (party.value!.settings?.TIME_TO_DRINK ?? party.value!.game?.defaultTimeToDrink ?? 20) as number;
  const percentage = (minutes / timeToDrink) * 100;

  if (percentage >= 80) {
    return STATE.STATE_1;
  } else if (percentage >= 60) {
    return STATE.STATE_2;
  } else if (percentage >= 40) {
    return STATE.STATE_3;
  } else {
    return STATE.STATE_4;
  }

})

const startTimer = () => {
  setInterval(() => now.value = Date.now(), 1e3);

  const time_ = localStorage.getItem("megademon:timeToDrink");
  if(time_) {
    timeToDrink.value = parseInt(time_);  
  }
}

const initWs = () => {
  playerChosen.value = localStorage.getItem("megademon:playerChosen") ?? "";

  websocket.value?.addEventListener("message", (event: any) => {
    const msg = event.data;
    try {
      const message = JSON.parse(msg) as IMessage;
      if(message.type === "HAVE_TO_DRINK") {
        const t = new Date(message.data.timeToDrink);
        timeToDrink.value = t.getTime();
        localStorage.setItem("megademon:timeToDrink", t.getTime().toString());
      } else if(message.type === "PLAYER_CHOSEN") {
        const playerChosen = message.data.player;
        localStorage.setItem("megademon:playerChosen", playerChosen);
      }
    } catch(ignored) {}
  });
}

const initWheel = () => {
    const ctx = wheelRef.value!.getContext("2d")!;
    const size = wheelRef.value!.width;

    const center = size / 2;
    const numSlices = players.value.length;
    const anglePerSlice = (2 * Math.PI) / numSlices;

    const _drawWheel = () => {
      for (let i = 0; i < numSlices; i++) {
        const startAngle = i * anglePerSlice;
        const endAngle = startAngle + anglePerSlice;

        ctx.fillStyle = i%2 === 0? `rgba(90, 75, 117, 1)` : 'rgba(140, 130, 165, 1)';
        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.arc(center, center, center - 5, startAngle, endAngle);
        ctx.closePath();
        ctx.fill();

        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(startAngle + anglePerSlice / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "rgba(220, 217, 229, 1)";
        ctx.font = "16px sans-serif";
        ctx.fillText(players.value[i], center - 10, 5);
        ctx.restore();
      }
    }

    _drawWheel();
}


const spin = () => {
  const numSlices = players.value.length;
  let currentRotation = 0;
  const spins = 5 + Math.random() * 5;
  const playerIndex = players.value.indexOf(playerChosen.value);
  const targetRotation = currentRotation + spins * 360 + playerIndex * 360;

  gsap.to("#wheel", {
    rotation: targetRotation,
    duration: 5,
    ease: "power4.out",
    onUpdate: () => {
      const angle = gsap.getProperty(wheelRef.value!, "rotation");
      wheelRef.value!.style.transform = `rotate(${angle}deg)`;
    },
    onComplete: () => {
      currentRotation = targetRotation % 360;
      hideWheel.value = true;
    }
  });
}

onMounted(() => {
  startTimer();
  initWs();
  initWheel();

  spin();
})
</script>

<style lang="scss" scoped>
@use "@/scss/utils/variables" as *;

h2.title {
  margin: 1em 0;
}
h3 {
  color: $gray-4;
  margin-bottom: .5em;
}
div.middle {
  height: 100vh;
  display: flex;
  text-align: center;
  align-items: center;
}
img {
  width: 23em;
  height: 25em;
  object-fit: contain;
  display: block;
  margin: auto;
  animation: bounce 3s infinite;
  margin-bottom: 2em;
}

@keyframes bounce {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.wheel-container {
  position: relative;
  width: 400px;
  height: 400px;
}
.pointer {
  position: absolute;
  z-index: 9;

  bottom: 7.5%;
  left: 50%;
  transform: translateX(-50%);
  
  width: 0;
  height: 0;

  border-left: 15px solid transparent;
  border-right: 15px solid transparent;
  border-bottom: 20px solid rgba(220, 217, 229, 1);
}
</style>
