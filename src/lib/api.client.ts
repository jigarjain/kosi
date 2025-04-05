import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_KOSI_API_ENDPOINT
});

export const initializeApiClient = (
  tokenProvider: () => Promise<string | null>
) => {
  apiClient.interceptors.request.use(async (config) => {
    // Get the path from the URL
    const url = config.url || "";

    // Only add auth token for /api/pages* endpoints
    if (url.startsWith("/pages")) {
      const token = await tokenProvider();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });
};
