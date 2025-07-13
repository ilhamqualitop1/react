import axios from "axios";

const API_URL = "http://localhost:5050/api/auth";

export const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  return response.data;
};

export const verifyOTP = async (email, otp) => {

try {
  const response = await axios.post(`${API_URL}/verify-otp`, { email, otp });
  return response.data;
} catch(error) {
  throw error;
}
  
 
};
