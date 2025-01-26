import Axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import qs from "qs";
import Cookies from "universal-cookie";
import createAuthRefreshInterceptor from "axios-auth-refresh";

const API: AxiosInstance = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ,
  paramsSerializer: {
    serialize: (params) => qs.stringify(params, { arrayFormat: "brackets" }),
  },
});

const requestHandler = (
  request: InternalAxiosRequestConfig<any>
): InternalAxiosRequestConfig<any> => {
  !!!request.headers["Accept"] &&
    (request.headers["Accept"] = "application/json");
  !!!request.headers["Content-Type"] &&
    (request.headers["Content-Type"] = "application/json");

  const cookie = new Cookies(String(request.headers.cookie));
  const user = cookie.get("kidzyLoginData");

  const URL = request.url || "";

  if (user && user?.accessToken) {
    request.headers.Authorization = `Bearer ${user?.accessToken}`;
  }

  if (/\[[a-zA-Z]+\]/.test(URL) && request.pathParams) {
    const pathParams = request.pathParams;
    const paramNamesArr = Array.from(
      URL.matchAll(/\[([a-zA-Z]+)\]/g),
      (m) => m[0]
    );
    const reformedUrl = paramNamesArr.reduce((res, paramName) => {
      const reducedParam = paramName.slice(1, -1);
      return res?.replace(paramName, pathParams[reducedParam]);
    }, request.url);
    return { ...request, url: reformedUrl };
  }

  return request;
};

interface AxiosErrorProps extends AxiosError {
  config: AxiosError["config"] & {
    _retry: boolean;
  };
}

const errorHandler = (error: AxiosErrorProps) => {
  const originalRequest = error.config;

  if (error.code === "ERR_NETWORK")
    console.error(
      "vpn خود را قطع و از برقراری ارتباط اینترنت خود اطمینان حاصل نمایید."
    );
  if (
    error?.response?.status === 500 &&
    originalRequest.url === '/user/refresh-token'
  ) {
    window.location.href = "/500";
  } else if (
    error?.response?.status === 502 ||
    error?.response?.status === 503
  ) {
    window.location.href = "/500";
  }
  return Promise.reject(error?.response?.data);
};

const successHandler = (response: AxiosResponse): AxiosResponse => {
  return response;
};

API.interceptors.request.use((request) => requestHandler(request));
API.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => successHandler(response),
  (error) => errorHandler(error)
);

const refreshAuthLogic = async (failedRequest: any) => {
  const cookies = new Cookies(failedRequest?.headers?.cookie);
  const user = cookies.get("kidzyLoginData");
  const appURL = new URL(process.env.NEXT_PUBLIC_APP_URL as string).hostname;
  console.log("hostname :", appURL);
  if (!user || !user?.refreshToken) {
    return Promise.reject();
  }

  const formData = {
    refreshToken: user?.refreshToken,
  };

  return await Axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/user/refresh-token`,
    {},
    { headers: formData }
  )
    .then(({ status, data }) => {
      if (status === 200) {
        if (data?.entity?.accessToken && data?.entity?.refreshToken) {
          cookies.set(
            "kidzyLoginData",
            {
              ...user,
              accessToken: data?.entity?.accessToken,
              refreshToken: data?.entity?.refreshToken,
            },
            { path: "/" }
          );
          setTimeout(() => {
            failedRequest.response.config.headers[
              "Authorization"
            ] = `Bearer ${data.accessToken}`;
            return Promise.resolve();
          }, 1000);
        }
      }
    })
    .catch((error) => {
      if (error?.response?.status === 400) {
        console.log("error in interceptor :", error);
      }
    });
};

createAuthRefreshInterceptor(API, refreshAuthLogic, {
  statusCodes: [401],
  pauseInstanceWhileRefreshing: true,
});

export default API;
