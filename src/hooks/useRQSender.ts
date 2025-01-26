import { commonResponse } from "@/interfaces/commonResponse";
import API from "@/utils/interceptor";
import {
  QueryKey,
  UseMutationOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  AxiosHeaders,
  Method,
  AxiosResponse,
  RawAxiosRequestHeaders,
} from "axios";

export const useRQSender = <TData, TError = commonResponse>({
  url,
  baseURL = undefined,
  headers = {},
  invalidateQuerieKeys,
  params,
  pathParams = {},
  method = "post",
  ...rest
}: UseMutationOptions<TData, TError, any> & {
  url: string;
  baseURL?: string;
  headers?:
    | (RawAxiosRequestHeaders &
        Partial<
          {
            [Key in Method as Lowercase<Key>]: AxiosHeaders;
          } & { common: AxiosHeaders }
        >)
    | AxiosHeaders;
  invalidateQuerieKeys?: QueryKey;
  params?: { [key: string]: any };
  pathParams?: { [key: string]: any };
  method?: "post" | "put" | "patch";
}) => {
  const queryClient = useQueryClient();

  const mutationFn = async (body: any): Promise<TData> => {
    const response: AxiosResponse<TData> = await API[method](url, body, {
      baseURL,
      headers,
      params,
      pathParams,
    });
    return response.data;
  };

  const mutation = useMutation<TData, TError, any>({
    ...rest,
    mutationFn,
    onSuccess: () => {
      if (invalidateQuerieKeys) {
        setTimeout(() => {
          invalidateQuerieKeys.forEach((queryKey: any) => {
            queryClient.invalidateQueries({ queryKey });
          });
        }, 1000);
      }
    },
  });

  return mutation;
};
