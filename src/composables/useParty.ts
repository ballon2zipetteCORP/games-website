import type { IGame } from "@/composables/useGames.ts";
import { QueryType, useGQLQueryStore } from "@/stores/useGQLQueryStore.ts";
import gql from "graphql-tag";

export interface IPartyMember {
  id: string;
  displayName: string;
}
export interface IParty<T = IGame> {
  id: string;
  status: string;
  settings: Record<string, unknown>;
  owner: IPartyMember;
  players: IPartyMember[];
  game: T;
}
export enum GameStatus {
  WAITING_FOR_PLAYERS = "WAITING_FOR_PLAYERS",
  READY = "READY",
  IN_PROGRESS = "IN_PROGRESS",
  ENDED = "ENDED",
  IN_ERROR = "IN_ERROR",
  UNKNOWN = "UNKNOWN",
}

const useParty = () => {
  const get = async <T>(id: string) => {
    const data = await useGQLQueryStore().query<{ party: IParty<T> }>({
      document: gql`
        query Party($id: ID!) {
          party(id: $id) {
            id
            status
            players {
              id
              displayName
            }
            owner {
              displayName
              id
            }
            settings
            game {
              id
              displayName
              createdAt
              maxPlayers
              minPlayers

              ... on Wereworlf {
                roles {
                  displayName
                  id
                  description
                  expectedActions
                  image
                }
              }
              ... on Megademon {
                defaultTimeToDrink
              }
            }
          }
        }
      `,
      type: QueryType.QUERY,
      variables: { id },
    });
    return data?.party ?? {};
  };

  const start = async (id: string) => {
    await useGQLQueryStore().query<{ startParty: { status: string } }>({
      document: gql`
        mutation StartGame($id: ID!) {
          startParty(id: $id) {
            id
            status
          }
        }
      `,
      type: QueryType.QUERY,
      variables: { id },
    });
  };

  const leave = async (id: string) => {
    await useGQLQueryStore().query({
      document: gql`
        mutation LeaveParty($id: ID!) {
          leaveParty(id: $id) {
            id
          }
        }
      `,
      type: QueryType.MUTATION,
      variables: { id },
    });
  };

  const join = async (id: string) => {
    const data = await useGQLQueryStore().query<{ joinParty: IParty }>({
      document: gql`
        mutation JoinParty($id: ID!) {
          joinParty(id: $id) {
            id
          }
        }
      `,
      type: QueryType.MUTATION,
      variables: { id },
    });
    return data.joinParty ?? {};
  };

  const saveSettings = async (
    id: string,
    settings: Record<string, unknown>
  ) => {
    const data = await useGQLQueryStore().query<{ savePartySettings: JSON }>({
      document: gql`
        mutation SavePartySettings($id: ID!, $settings: JSON!) {
          savePartySettings(id: $id, settings: $settings) {
            id
          }
        }
      `,
      type: QueryType.MUTATION,
      variables: { id, settings },
    });
    return data?.savePartySettings ?? {};
  };

  return {
    get,
    join,
    leave,
    saveSettings,
    start,
  };
};

export default useParty;
