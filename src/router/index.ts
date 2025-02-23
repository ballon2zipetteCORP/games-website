import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import NewGameView from "@/views/party/PartyCreationView.vue";
import PartyRoomView from "@/views/party/PartyRoomView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/new-game',
      name: 'new-game',
      component: NewGameView,
    },
    {
      path: '/party/:id',
      name: 'party',
      component: PartyRoomView,
    }
  ],
})

export default router
