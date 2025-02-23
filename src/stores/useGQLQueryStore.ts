import { defineStore } from 'pinia'
import {useLazyQuery, useMutation} from "@vue/apollo-composable";
import {cloneDeep} from "apollo-utilities";

export enum QueryType {
    QUERY = "QUERY",
    MUTATION = "MUTATION"
}

export const useGQLQueryStore = defineStore('gqlStore', () => {

    const _parseError = (errors: any) => {
        return errors.map(({ message }: {message: string;}) => message).join(", ");
    }

    const _resolveQuery = <T>(document: any, variables: Record<string, unknown>): Promise<T> => {
        return new Promise((resolve, reject) => {
            const { onResult, load, stop } = useLazyQuery(document, variables, {
                errorPolicy: "all",
                fetchPolicy: "no-cache"
            });

            onResult(({ data, loading, errors }) => {
                if (!loading) {
                    if (errors?.length) {
                        return reject(_parseError(errors));
                    }
                    return resolve(cloneDeep(data));
                }
                stop()
            });
            load();
        });
    }

    const _resolveMutation = <T>(document: any, variables: Record<string, unknown>): Promise<T> => {
        return new Promise((resolve, reject) => {
            const { mutate } = useMutation(document, {
                fetchPolicy: "network-only",
                variables
            });
            mutate()
                .then(({ data }: any) => resolve(cloneDeep(data)))
                .catch(error => reject(_parseError(error?.graphQLErrors)));
        });
    }

    const query = <T>({type, document, variables = {}}: {type: QueryType, document: any, variables?: Record<string, unknown>}): Promise<T> =>  {
        if(type === QueryType.QUERY) {
            return _resolveQuery<T>(document, variables);
        } else if(type === QueryType.MUTATION) {
            return _resolveMutation<T>(document, variables);
        }
        throw new Error("Invalid type provided");
    }

    return {query}

});
