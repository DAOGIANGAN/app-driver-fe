import apiClient from "./apiclient";
import TokenService from "../services/token.service";

class NotificationApi {
  static async pushNotification(token: string): Promise<any> {
    const refreshToken = await TokenService.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token found");
    }
    try {
      const response = await apiClient.post(
        "/fcm-token/save-or-update",
        {
          token,
        },
        {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error pushing notification:", error);
      throw error;
    }
  }
}

export default NotificationApi;
