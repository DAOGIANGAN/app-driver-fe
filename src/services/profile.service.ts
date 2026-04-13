import * as SecureStore from 'expo-secure-store';

class ProfileService {
  private static ID_KEY = 'id';
  private static ID_USER_KEY = 'userId';
  private static NAME_KEY = 'name';
  private static EMAIL_KEY = 'email';
  private static URL_PUBLIC_AVATAR_KEY = 'urlPublicAvatar';
  private static PATH_AVATAR_KEY = 'pathAvatar';
  private static PHONE_KEY = 'phone';
  private static DOB_KEY = 'dob';
  private static USERNAME_KEY = 'username';
//   private static IS_PREMIUM = 'isPremium';
//   private static PREMIUM_EXPIRE_AT = 'premiumExpireAt';
//   private static PREMIUM_ID = 'premiumId';

  static async saveProfile(data: any): Promise<void> {
    console.log(
        "Lưu thông tin người dùng thành công:",
        data.id,
        data.userId,
        data.name,
        data.email,
        data.urlPublicAvatar,
        data.pathAvatar,
        data.phone,
        data.dob,
        data.username,
        
        // data.isPremium,
        // data.premiumExpireAt,
        // data.premiumId
    );

    await SecureStore.setItemAsync(this.ID_KEY, String(data.id)); // Chuyển số thành chuỗi
    await SecureStore.setItemAsync(this.ID_USER_KEY, String(data.userId)); // Chuyển số thành chuỗi
    await SecureStore.setItemAsync(this.NAME_KEY, data.name || ""); // Đảm bảo giá trị không phải null
    await SecureStore.setItemAsync(this.EMAIL_KEY, data.email || "");
    await SecureStore.setItemAsync(this.URL_PUBLIC_AVATAR_KEY, data.urlPublicAvatar || "");
    await SecureStore.setItemAsync(this.PATH_AVATAR_KEY, data.pathAvatar || "");
    await SecureStore.setItemAsync(this.PHONE_KEY, data.phone ? String(data.phone) : ""); // Chuyển số hoặc null thành chuỗi
    await SecureStore.setItemAsync(this.DOB_KEY, data.dob || "");
    await SecureStore.setItemAsync(this.USERNAME_KEY, data.username || "");
    // await SecureStore.setItemAsync(this.IS_PREMIUM, data.isPremium? String(data.isPremium):""); // Chuyển số hoặc null thành chuỗi""
    // await SecureStore.setItemAsync(this.PREMIUM_EXPIRE_AT, data.premiumExpireAt || "");
    // await SecureStore.setItemAsync(this.PREMIUM_ID, data.premiumId? String(data.premiumId):""); // Chuyển số hoặc null thành chuỗi
    }
    
    static async getProfile(): Promise<any> {
    const id = await SecureStore.getItemAsync(this.ID_KEY);
    const userId = await SecureStore.getItemAsync(this.ID_USER_KEY);
    const name = await SecureStore.getItemAsync(this.NAME_KEY);
    const email = await SecureStore.getItemAsync(this.EMAIL_KEY);
    const urlPublicAvatar = await SecureStore.getItemAsync(this.URL_PUBLIC_AVATAR_KEY);   
    const pathAvatar = await SecureStore.getItemAsync(this.PATH_AVATAR_KEY);
    const phone = await SecureStore.getItemAsync(this.PHONE_KEY);
    const dob = await SecureStore.getItemAsync(this.DOB_KEY);
    const username = await SecureStore.getItemAsync(this.USERNAME_KEY);
    // const isPremium = await SecureStore.getItemAsync(this.IS_PREMIUM);
    // const premiumExpireAt = await SecureStore.getItemAsync(this.PREMIUM_EXPIRE_AT);
    // const premiumId = await SecureStore.getItemAsync(this.PREMIUM_ID);
    // if (!id || !name || !email || !urlPublicAvatar || !pathAvatar || !phone || !dob || !username || !isPremium || !premiumExpireAt) {
    //   return null;
    // }
    
    if(!id || !name || !email || !urlPublicAvatar || !pathAvatar || !phone || !dob || !username || !userId) {
        return null;
    }

    return {
        id: id ? parseInt(id) : null,
        userId: userId ? parseInt(userId) : null,
        name: name,
        email: email,
        urlPublicAvatar: urlPublicAvatar,
        pathavatar: pathAvatar,
        phone: phone,
        dob: dob,
        username: username,
        // isPremium: isPremium,
        // premiumExpireAt: premiumExpireAt,
        // premiumId: premiumId
        }
    }

    static async removeProfile(): Promise<void> {
        await SecureStore.deleteItemAsync(this.ID_KEY);
        await SecureStore.deleteItemAsync(this.ID_USER_KEY);
        await SecureStore.deleteItemAsync(this.NAME_KEY);
        await SecureStore.deleteItemAsync(this.EMAIL_KEY);
        await SecureStore.deleteItemAsync(this.URL_PUBLIC_AVATAR_KEY);
        await SecureStore.deleteItemAsync(this.PATH_AVATAR_KEY);
        await SecureStore.deleteItemAsync(this.PHONE_KEY);
        await SecureStore.deleteItemAsync(this.DOB_KEY);
        await SecureStore.deleteItemAsync(this.USERNAME_KEY);
        // await SecureStore.deleteItemAsync(this.IS_PREMIUM);
        // await SecureStore.deleteItemAsync(this.PREMIUM_EXPIRE_AT);
        // await SecureStore.deleteItemAsync(this.PREMIUM_ID);
        }
    
    static async getId(): Promise<number | null> {
        const id = await SecureStore.getItemAsync(this.ID_KEY);
        return id ? parseInt(id) : null;
    }

    static async getUserId(): Promise<number | null> {
        const userId = await SecureStore.getItemAsync(this.ID_USER_KEY);
        return userId ? parseInt(userId) : null;
    }

    static async getName(): Promise<string | null> {
        return await SecureStore.getItemAsync(this.NAME_KEY);
    }

    static async getEmail(): Promise<string | null> {
        return await SecureStore.getItemAsync(this.EMAIL_KEY);
    }

    static async geturlPublicAvatar(): Promise<string | null> {
        return await SecureStore.getItemAsync(this.URL_PUBLIC_AVATAR_KEY);
    }

    static async getpathAvatar(): Promise<string | null> {
        return await SecureStore.getItemAsync(this.PATH_AVATAR_KEY);
    }

    static async getPhone(): Promise<string | null> {
        return await SecureStore.getItemAsync(this.PHONE_KEY);
    }

    static async getDob(): Promise<string | null> {
        return await SecureStore.getItemAsync(this.DOB_KEY);
    }

    static async getUsername(): Promise<string | null> {
        return await SecureStore.getItemAsync(this.USERNAME_KEY);
    }

    // static async getIsPremium(): Promise<string | null> {
    //     return await SecureStore.getItemAsync(this.IS_PREMIUM);
    // }

    // static async getPremiumExpireAt(): Promise<string | null> {
    //     return await SecureStore.getItemAsync(this.PREMIUM_EXPIRE_AT);
    // }

    // static async getPremiumId(): Promise<string | null> {
    //     return await SecureStore.getItemAsync(this.PREMIUM_ID);
    // }

    static async updateProfile(data:any): Promise<void> {
        if (data.name) {
            await SecureStore.setItemAsync(this.NAME_KEY, data.name);
        }
        if (data.email) {
            await SecureStore.setItemAsync(this.EMAIL_KEY, data.email);
        }
        if (data.urlPublicAvatar) {
            await SecureStore.setItemAsync(this.URL_PUBLIC_AVATAR_KEY, data.urlavatar);
        }
        if (data.pathAvatar) {
            await SecureStore.setItemAsync(this.PATH_AVATAR_KEY, data.pathavatar);
        }
        if (data.phone) {
            await SecureStore.setItemAsync(this.PHONE_KEY, data.phone);
        }
        if (data.dob) {
            await SecureStore.setItemAsync(this.DOB_KEY, data.dob);
        }
        if (data.username) {
            await SecureStore.setItemAsync(this.USERNAME_KEY, data.username);
        }
        // if (data.isPremium) {
        //     await SecureStore.setItemAsync(this.IS_PREMIUM, data.isPremium);
        // }
        // if (data.premiumExpireAt) {
        //     await SecureStore.setItemAsync(this.PREMIUM_EXPIRE_AT, data.premiumExpireAt);
        // }
        // if (data.premiumId) {
        //     await SecureStore.setItemAsync(this.PREMIUM_ID, data.premiumId);
        // }
    }

    // static async isPremium(): Promise<boolean> {
    //     try {
    //       const isPremium = await SecureStore.getItemAsync(this.IS_PREMIUM);
    //       const premiumExpireAt = await SecureStore.getItemAsync(this.PREMIUM_EXPIRE_AT);

    //       // Kiểm tra nếu `isPremium` không tồn tại hoặc không phải "true"
    //       if (!isPremium || isPremium !== "true") {
    //         return false;
    //       }

    //       // Kiểm tra nếu `premiumExpireAt` không tồn tại hoặc đã hết hạn
    //       if (!premiumExpireAt || new Date(premiumExpireAt) <= new Date()) {
    //         return false;
    //       }

    //       return true; // Người dùng là Premium và chưa hết hạn
    //     } catch (error) {
    //       console.error("Error checking premium status:", error);
    //       return false; // Trả về false nếu có lỗi
    //     }
    //   }
}
export default ProfileService;