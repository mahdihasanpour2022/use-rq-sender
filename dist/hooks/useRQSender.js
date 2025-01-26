import API from "@/utils/interceptor";
import { useMutation, useQueryClient, } from "@tanstack/react-query";
export const useRQSender = ({ url, baseURL = undefined, headers = {}, invalidateQuerieKeys, params, pathParams = {}, method = "post", ...rest }) => {
    const queryClient = useQueryClient();
    const mutationFn = async (body) => {
        const response = await API[method](url, body, {
            baseURL,
            headers,
            params,
            pathParams,
        });
        return response.data;
    };
    const mutation = useMutation({
        ...rest,
        mutationFn,
        onSuccess: () => {
            if (invalidateQuerieKeys) {
                setTimeout(() => {
                    invalidateQuerieKeys.forEach((queryKey) => {
                        queryClient.invalidateQueries({ queryKey });
                    });
                }, 1000);
            }
        },
    });
    return mutation;
};
