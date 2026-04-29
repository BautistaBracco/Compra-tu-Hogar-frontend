declare module './api' {
  export function apiCall(endpoint: string, options?: any): Promise<any>;
  export function apiGet(endpoint: string, params?: any): Promise<any>;
  export function apiPost(endpoint: string, data?: any): Promise<any>;
  export function apiPut(endpoint: string, data?: any): Promise<any>;
  export function apiDelete(endpoint: string): Promise<any>;
  export function apiPatch(endpoint: string, data?: any): Promise<any>;
}

