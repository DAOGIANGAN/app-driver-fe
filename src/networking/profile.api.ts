import TokenService from "../services/token.service";
import apiClient from "./apiclient";

interface Device {
    id: string;
    deviceName: string;
    createdAt: string;
    userAgent: string;
  }

class ProfileApi {   
    static async getProfile(): Promise<any> {
        const accessToken = await TokenService.getAccessToken();
        console.log("Access token in getProfile:", accessToken);
        if (!accessToken) {
            throw new Error("No access token found");
        }
        try {
            const response = await apiClient.get("/auth/profile/", {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            return response.data;
        }
        catch (error) {
            console.error("Error fetching profile:", error);
            throw error;
        }
    }
    
    static async updateProfile(data: any): Promise<any> {
        const accessToken = await TokenService.getAccessToken();
        if (!accessToken) {
            throw new Error("No access token found");
        }
        try {
            const response = await apiClient.post("/userprofile/update-profile", data, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error updating profile:", error);
            throw error;
        }
    }

    static async updateAvatar(data: any): Promise<any> {
        const accessToken = await TokenService.getAccessToken();
        if (!accessToken) {
            throw new Error("No access token found");
        }
        try {
            const response = await apiClient.post("/userprofile/update-avatar", data, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error updating avatar:", error);
            throw error;
        }
    }

    static async updateName(data: any): Promise<any> {
        const accessToken = await TokenService.getAccessToken();
        if (!accessToken) {
            throw new Error("No access token found");
        }
        try {
            const response = await apiClient.put("/userprofile/update-name", data, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error updating name:", error);
            throw error;
        }
    }

    static async updateGmail(data: any): Promise<any> {
        const accessToken = await TokenService.getAccessToken();
        if (!accessToken) {
            throw new Error("No access token found");
        }
        try {
            const response = await apiClient.put("/userprofile/update-gmail", data, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error updating gmail:", error);
            throw error;
        }
    }

    static async updateDob(data: any): Promise<any> {
        const accessToken = await TokenService.getAccessToken();
        if (!accessToken) {
            throw new Error("No access token found");
        }
        try {
            const response = await apiClient.put("/userprofile/update-dob", data, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error updating dob:", error);
            throw error;
        }
    }

    static async getAvatar(): Promise<any> {
        const accessToken = await TokenService.getAccessToken();
        if (!accessToken) {
            throw new Error("No access token found");
        }
        try {
            const response = await apiClient.get("/userprofile/get-avatar", {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching avatar:", error);
            throw error;
        }
    }

    static async getLoggedDevices(): Promise<{ devices: Device[] }> {
        const accessToken = await TokenService.getAccessToken();
        if (!accessToken) {
          throw new Error('No access token found');
        }
    
        try {
          const response = await apiClient.get('/refresh-token/get-all-device', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          return { devices: response.data }; // Trả về danh sách thiết bị
        } catch (error) {
          console.error('Error fetching logged devices:', error);
          throw error;
        }
      }
    

      static async deleteDevice(deviceId: string): Promise<any> {
        const accessToken = await TokenService.getAccessToken();
        if (!accessToken) {
          throw new Error('No access token found');
        }
    
        try {
          const response = await apiClient.delete(`/refresh-token/delete-device?deviceId=${deviceId}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          return response.data; // Trả về kết quả xóa thiết bị
        } catch (error) {
          console.error('Error deleting device:', error);
          throw error;
        }
      }
    
      static async deleteAllDevices(): Promise<any> {
        const accessToken = await TokenService.getAccessToken();
        if (!accessToken) {
          throw new Error('No access token found');
        }
    
        try {
          const response = await apiClient.delete('/refresh-token/delete-device', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          return response.data; // Trả về kết quả xóa tất cả thiết bị
        } catch (error) {
          console.error('Error deleting all devices:', error);
          throw error;
        }
      }

    static async changePassword(data: any): Promise<any> {
        const accessToken = await TokenService.getAccessToken();
        if (!accessToken) {
            throw new Error("No access token found");
        }
        try {
            const response = await apiClient.post("/user/reset-password", data, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error changing password:", error);
            throw error;
        }
    }
}

export default ProfileApi;