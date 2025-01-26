import { commonResponse } from "@/interfaces/commonResponse";
import { QueryKey, UseMutationOptions } from "@tanstack/react-query";
import { AxiosHeaders, Method, RawAxiosRequestHeaders } from "axios";
export declare const useRQSender: <TData, TError = commonResponse<any>>({ url, baseURL, headers, invalidateQuerieKeys, params, pathParams, method, ...rest }: UseMutationOptions<TData, TError, any> & {
    url: string;
    baseURL?: string;
    headers?: (RawAxiosRequestHeaders & Partial<{ [Key in Method as Lowercase<Key>]: AxiosHeaders; } & {
        common: AxiosHeaders;
    }>) | AxiosHeaders;
    invalidateQuerieKeys?: QueryKey;
    params?: {
        [key: string]: any;
    };
    pathParams?: {
        [key: string]: any;
    };
    method?: "post" | "put" | "patch";
}) => import("@tanstack/react-query").UseMutationResult<TData, TError, any, unknown>;
