import './scss/main.scss'
import './scss/assets/buttons.scss'
import './scss/assets/inputs.scss'
import './scss/assets/font-loader.scss'

import {createApp} from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import createI18n from "@/services/i18n.ts";

import {apolloProvider, defaultClient} from "@/services/graphql.ts";
import {ApolloClients, provideApolloClient} from "@vue/apollo-composable";

const app = createApp(App)

app.provide(ApolloClients, apolloProvider.clients);
provideApolloClient(defaultClient);

import mdiVue from 'mdi-vue/v3'
import * as mdiJS from '@mdi/js'

app.use(mdiVue, { icons: mdiJS })

app.use(createPinia())
app.use(router)
app.use(createI18n);

app.mount('#app')
