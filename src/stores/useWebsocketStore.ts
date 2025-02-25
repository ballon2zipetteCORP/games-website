import {defineStore, storeToRefs} from "pinia";
import {ref} from "vue";
import {useIdentityStore} from "@/stores/useIdentityStore.ts";

export interface IMessage {
    gameId: string;
    type: string;
    data: Record<string, any>;
}

export const useWebsocketStore = defineStore('websocketStore', () => {

    const identityId = ref<string|null>(null);
    const websocket = ref<WebSocket|null>(null);

    const keepAliveTimeout = ref<number | null>(null)
    const keepAliveInterval = ref<number | null>(null)

    // time until the next keep alive check
    const KEEP_ALIVE_CHECK = 3e4
    const KEEP_ALIVE_TIMEOUT = 3e4

    const init = () => {
        const {me} = storeToRefs(useIdentityStore());

        identityId.value = me.value!.id;
        websocket.value = new WebSocket(`${import.meta.env.VITE_WSS}/${identityId.value}`);

        websocket.value.onopen = () => {
            if (keepAliveInterval.value) {
                clearInterval(keepAliveInterval.value)
            }
            keepAliveInterval.value = setInterval(ping, KEEP_ALIVE_CHECK)

            _log('Connection opened');
        }
        websocket.value.onclose = () => {
            _log('Connection closed');
        }
        websocket.value.onerror = () => {
            console.log(`Connection error: ${JSON.stringify(websocket)}`);
        }

        // keep alive connection
        websocket.value.addEventListener('message', (event) => {
            const message = event.data
            if (message === '__pong__') {
                pong()
                return
            }
        })
    }

    const close = () => {
        websocket.value?.close()
        _log('websocket was closed normally')
    }

    const ping = () => {
        send('__ping__')
        _log('keep alive - waiting for a response...')

        keepAliveTimeout.value = setTimeout(() => {
            _log('Connection with the socket lost, reconnecting...')
            init()
        }, KEEP_ALIVE_TIMEOUT)
    }

    const pong = () => {
        if (keepAliveTimeout.value) {
            clearTimeout(keepAliveTimeout.value)
            _log('keep alive - response received !')
        }
    }

    const send = (data: string | Record<string, unknown>) => {
        let message: string
        if (typeof data !== 'string') {
            message = JSON.stringify(data)
        } else {
            message = data
        }

        if (websocket.value?.readyState === WebSocket.OPEN) {
            websocket.value.send(message)
        }
    }

    const _log = (message: string) => {
        console.log(`[Connected ID: ${identityId.value}] ${message}`);
    }

    return {
        init,
        close,
        send,
        websocket
    }

});