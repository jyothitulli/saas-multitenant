import axios from "axios";

// Create a pre-configured axios instance
const apiClient = axios.create({
  baseURL: "http://localhost:5000/api", // Your backend API
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token to every request if available
apiClient.interceptors.request.use(
  (config) => {
    const authToken = localStorage.getItem("token");
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
