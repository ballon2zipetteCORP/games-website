import {QueryType, useGQLQueryStore} from "@/stores/useGQLQueryStore.ts";
import gql from "graphql-tag";

export interface IGame {
    id: string;
    displayName: string;
    maxPlayers: number;
    minPlayers: number;

    roles: {
        id: string;
        displayName: string;
        image: string;
        description: string;
        expectedActions: string[];
    }[];
}

export type TGames = IGame[];

const useGames = () => {

    const getAll = async () => {
        const data = await useGQLQueryStore().query<{ games: TGames }>({
            document: gql`
                query Games {
                    games {
                        id
                        displayName
                    }
                }
            `,
            type: QueryType.QUERY
        });
        return data?.games ?? [];
    }

    const create = async (gameId: string) => {
        const data = await useGQLQueryStore().query<{
            createParty: { id: string }
        }>({
            document: gql`
                mutation CreateParty($gameId: ID!) {
                    createParty(gameId: $gameId) {
                        id
                    }
                }
            `,
            type: QueryType.MUTATION,
            variables: {
                gameId
            }
        });
        return data?.createParty ?? {};
    }

    return {
        getAll,
        create
    }

}

export default useGames;