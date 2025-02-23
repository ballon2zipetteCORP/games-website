import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {QueryType, useGQLQueryStore} from "@/stores/useGQLQueryStore.ts";
import gql from "graphql-tag";
import {jwtDecode} from "jwt-decode";

interface IMe {
    displayName: string;
    id: string;
}

export const useIdentityStore = defineStore('identityStore', () => {

    const token = ref<string|null>(localStorage.getItem("access_token"));
    const me = computed({
        get: () => {
            if(!token.value) return null;
            return _unserialize(token.value);
        },
        set: (value: string) => {
            token.value = value;
            localStorage.setItem("access_token", value);
        }
    })

    const _unserialize = (token: string): IMe | null => {
        try {
            const decoded = jwtDecode(token)
            return decoded as IMe
        } catch (e) {
            console.error(e)
            resetIdentity()
        }
        return null
    }

    const createIdentity = async (displayName: string) => {
        if(me.value) return;
        const data = await useGQLQueryStore().query<{ createIdentity: string; }>({
            type: QueryType.MUTATION,
            document: gql`
                mutation CreateIdentity($displayName: String!) {
                    createIdentity(displayName: $displayName)
                }
            `,
            variables: { displayName }
        });
        const accessToken = data?.createIdentity;
        if(accessToken) {
          me.value = accessToken;
        }
    };

    const resetIdentity = () => {
        localStorage.removeItem("access_token");
        token.value = null;
    }

    return {
        resetIdentity,
        createIdentity,
        me,
        token
    }

});