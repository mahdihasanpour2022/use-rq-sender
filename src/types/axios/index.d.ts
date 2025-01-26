import { AxiosRequestConfig as AxiosRequestConfigParent } from 'axios';

declare module 'axios' {
  interface AxiosRequestConfig extends AxiosRequestConfigParent {
    pathParams?: Record<string, string>;
  }
}