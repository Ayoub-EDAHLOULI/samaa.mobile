import axios from "axios";

// Pull the API URL directly from the .env file.
// We provide a fallback just in case the .env fails to load.
const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://192.168.11.230:5000/api/v1";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 40000, // 40 seconds (To account for the AI processing time)
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request Interceptor (Ready for JWT authentication)
apiClient.interceptors.request.use(
  async (config) => {
    // We will activate this when the Auth module is built
    // const token = await SecureStore.getItemAsync('userToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
