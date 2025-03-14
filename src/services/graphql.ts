import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client/core";
import { setContext } from "@apollo/client/link/context";
import { createApolloProvider } from "@vue/apollo-option";
import {storeToRefs} from "pinia";
import {useIdentityStore} from "@/stores/useIdentityStore.ts";

const authLink = setContext(async (_, {headers}) => {
    const identityStore = useIdentityStore();
    const {token} = storeToRefs(identityStore);

    let defaultHeaders: Record<string, unknown> = {};
    if(headers) {
        defaultHeaders = {...defaultHeaders, ...headers};
    }

    if(token.value) {
        defaultHeaders["authorization"] = `Bearer ${token.value}`;
    }

    defaultHeaders["content-type"] = "application/json";

    return {headers: defaultHeaders};
});

const httpLink = createHttpLink({
    uri: import.meta.env.VITE_API_URL,
});
export const defaultClient = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache({ addTypename: false })
});

export const apolloProvider = createApolloProvider({
    defaultClient
});