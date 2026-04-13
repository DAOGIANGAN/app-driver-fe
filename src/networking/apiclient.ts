// networking/apiclient.ts
import axios from "axios";

// Khai báo URL API chính
const API_URL = process.env.EXPO_PUBLIC_API_URL;

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Import interceptor

export default apiClient;
