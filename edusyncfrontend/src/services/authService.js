import API from "./api"; // your axios instance

export const loginUser = async (email, password) => {
  try {
    const response = await API.post("/Auth/login", { email, password });
    return response.data;
  } catch (error) {
    console.error("Login failed:", error.response?.data || error.message);
    throw error.response?.data || error.message || "Login failed";
  }
};