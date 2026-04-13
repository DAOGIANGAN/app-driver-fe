import messaging from "@react-native-firebase/messaging";
import * as SecureStore from "expo-secure-store";

import notifee, { AndroidImportance, AndroidStyle } from "@notifee/react-native";
import { NavigationContainerRef, ParamListBase } from "@react-navigation/native";
import { AppState } from "react-native";
import NotificationApi from "../networking/notification.api";

export class FCM {

  static navigation: NavigationContainerRef<ParamListBase>;
  static pendingNotification: any = null;

  // Set navigation từ App.js hoặc nơi khởi tạo
  static setNavigation(nav: NavigationContainerRef<ParamListBase>) {
  this.navigation = nav;
  // Nếu có pending thì xử lý
  if (this.pendingNotification) {
    this.handleRemoteMessage(this.pendingNotification, true);
    this.pendingNotification = null;
  }
}
  static handlePendingNotificationIfAny() {
  if (this.pendingNotification && this.navigation?.isReady?.()) {
    this.handleRemoteMessage(this.pendingNotification, true);
    this.pendingNotification = null;
  }
}

  static getChannelId(notification: any): string {
    if (notification?.title === "New reply to your post") return 'comment';
    if (notification?.title === "New Reaction") return 'reaction';
    if (notification?.title === "New message") return 'chat';
    if (notification?.title === "Friend Request") return 'friend_request';
    if (notification?.title === "Friend Request Accepted") return 'friend_request_accepted';
    return 'default';
  }

  static async displayLocalNotification(title: string, body: string, notification?: any, androidStyle?: any) {
    await notifee.requestPermission();

    const channelId = this.getChannelId(notification || {});
    console.log("Channel ID:", channelId);
    await notifee.displayNotification({
      title,
      body,
      android: {
        channelId,
        //smallIcon: 'ic_notification',
        importance: AndroidImportance.HIGH,
        sound: 'default',
        pressAction: {
          id: 'default',
        },
      style: androidStyle,
      },
    });
  }

  static async requestUserPermission(): Promise<boolean> {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log("Authorization status:", authStatus);
        return true; // Trả về true nếu quyền được cấp
      }
      return false; // Trả về false nếu quyền không được cấp
    } catch (error) {
      console.error("Error requesting permission:", error);
      return false; // Trả về false nếu có lỗi
    }
  }

  static async pushTokenToServer(token: string) {
    try {
      const response = await NotificationApi.pushNotification(token);
      console.log("Push notification response:", response);
    } catch (error) {
      console.error("Error pushing notification:", error);
    }
  }

  static handledKeys = new Set<string>();

  static getUniqueKey(remoteMessage: any): string | null {
    if (remoteMessage?.notification.title ==="New reply to your post") return `reply-${remoteMessage.data.messageId}`;
    if (remoteMessage?.notification.title ==="New React") return `react-${remoteMessage.data.reactType}-${remoteMessage.data.postId}`;
    if (remoteMessage?.notification.title ==="New message") return `chat-${remoteMessage.data.senderId}-${remoteMessage.data.messageText}-${remoteMessage.data.messageType}`;
    if (remoteMessage?.notification.title ==="Friend Request") return `friend-${remoteMessage.data.senderId}`;
    if (remoteMessage?.notification.title ==="Friend Request Accepted") return `friend-accept-${remoteMessage.data.senderId}`;
    return null;
  }

  static async handleRemoteMessage(remoteMessage: any, isFromTap = false) {
    if (!remoteMessage) return;
    const { data, notification } = remoteMessage;

    const uniqueKey = this.getUniqueKey(remoteMessage);
    if (uniqueKey && this.handledKeys.has(uniqueKey)) {
      console.log("Already handled:", uniqueKey);
      return;
    }
    if (uniqueKey) {
      this.handledKeys.add(uniqueKey);
      setTimeout(() => this.handledKeys.delete(uniqueKey), 30000); // Xoá sau 10s
    }

    if (notification?.title === "New reply to your post") {
      // Reply to post
      console.log("Template: Reply to Post");
      const ms = data.messageText || notification?.body || "";     
      // Chỉ hiển thị notification khi app foreground
  if (AppState.currentState === "active" && uniqueKey) {
    await this.displayLocalNotification(
      "New Reply",
      `${data.senderName}: ${ms}`,
      data
    );
  }
      console.log("isFromTap", isFromTap);
      if (isFromTap===true && this.navigation) {
        this.navigation.navigate("Chat", { 
          friendId: Number(data.senderId),
          friendName: data.senderName,
          friendUsername: data.senderUsername,
          avatar: data.senderAvatar,
         });
      }

    } else if (notification?.title === "New React") {
      // React to post
      console.log("Template: Reaction to Post");
      const ms = data.reactType || notification?.body || "";
      if (AppState.currentState === "active" && uniqueKey) {
        await this.displayLocalNotification(
          "New Reaction",
          `${data.senderName} reacted: ${ms} to your post`,
          data
        );
      }

      if (isFromTap===true && this.navigation) {
        this.navigation.navigate("Chat", { 
          friendId: Number(data.senderId),
          friendName: data.senderName,
          friendUsername: data.senderUsername,
          avatar: data.senderAvatar,
         });
      }

    } else if(notification?.title === "New message") {
      // Default: Message
      console.log("New message");
      const ms = data.messageText || notification?.body || "";
      if (AppState.currentState === "active" && uniqueKey) {
        let androidStyle = undefined;
        if (data.messageType === "image" && data.mediaUrl) {
          androidStyle = {
            type: AndroidStyle.BIGPICTURE,
            picture: data.mediaUrl, // Đường dẫn ảnh
          };
        } else if (data.messageType === "video" && data.thumbnailUrl) {
          androidStyle = {
            type: AndroidStyle.BIGPICTURE,
            picture: data.thumbnailUrl, // Đường dẫn thumbnail video
          };
        }
        await this.displayLocalNotification("New Message", `${data.senderName}: ${ms}`,data, androidStyle);
      }

      if (isFromTap===true && this.navigation) {
        this.navigation.navigate("Chat", { 
          friendId: Number(data.senderId),
          friendName: data.senderName,
          friendUsername: data.senderUsername,
          avatar: data.senderAvatar,
         });
      }
    } else if (notification?.title === "Friend Request") {
      // Friend request
      console.log("Template: Friend Request");
      if (AppState.currentState === "active" && uniqueKey) {
        await this.displayLocalNotification("Friend Request", `${data.senderName} sent you a friend request.`,data);
      }
      if (isFromTap===true && this.navigation) {
        console.log("Navigating to Friend");
        this.navigation.navigate("Friend");
      }
    } else if (notification?.title === "Friend Request Accepted") {
      // Accept friend request
      console.log("Template: Accept Friend Request");
      if (AppState.currentState === "active" && uniqueKey) {
        await this.displayLocalNotification("Friend Request", `${data.senderName} accepted your friend request.`,data);
      }
      if (isFromTap===true && this.navigation) {
        console.log("Navigating to Friend");
        this.navigation.navigate("Friend");
      }
    }
}


  static async getToken() {
    if (!this.requestUserPermission()) return null;
    try {
      const token = await messaging().getToken();
      console.log("FCM Token:", token);
      return token;
    } catch (error) {
      console.error("Error getting FCM token:", error);
      return null;
    }
  }

  static async saveTokenToSecureStore(token: string) {
    try {
      await SecureStore.setItemAsync("fcmToken", token);
      console.log("FCM token saved to secure store:", token);
    } catch (error) {
      console.error("Error saving FCM token to secure store:", error);
    }
  }

  static async getTokenFromSecureStore() {
    try {
      const token = await SecureStore.getItemAsync("fcmToken");
      console.log("FCM token retrieved from secure store:", token);
      return token;
    } catch (error) {
      console.error("Error retrieving FCM token from secure store:", error);
      return null;
    }
  }

  static async initializeFCM() {
    try {
      const authRequest = await this.requestUserPermission();
      if (authRequest) {
        const newToken = await this.getToken();
        if (!newToken) {
          console.warn("FCM token is null");
          return; // Dừng lại nếu không lấy được token
        }
        const oldToken = await SecureStore.getItemAsync("fcm_token");
        console.log("Old token:", oldToken);
        if (newToken !== oldToken) {
          await SecureStore.setItemAsync("fcm_token", newToken);
          await this.pushTokenToServer(newToken);
        }
      }
    } catch (error) {
      console.error("Error getting FCM token:", error);
    }

    // Tạo các notification channels
    await notifee.createChannel({ id: 'default', name: 'Other Notifications', importance: AndroidImportance.DEFAULT, sound: 'default' });
    await notifee.createChannel({ id: 'comment', name: 'Post Replies', importance: AndroidImportance.HIGH, sound: 'default' });
    await notifee.createChannel({ id: 'reaction', name: 'Reactions', importance: AndroidImportance.HIGH , sound: 'default' });
    await notifee.createChannel({ id: 'friend_request', name: 'Friend Requests', importance: AndroidImportance.HIGH, sound: 'default' });
    await notifee.createChannel({ id: 'chat', name: 'Chat Messages', importance: AndroidImportance.HIGH , sound: 'default' });
    await notifee.createChannel({ id: 'friend_request_accepted', name: 'Friend Request Accepted', importance: AndroidImportance.HIGH , sound: 'default' });

    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log(
        "Notification caused app to open from background state:", remoteMessage);
      if (!this.navigation) {
          this.pendingNotification = remoteMessage;
        } else {
          this.handleRemoteMessage(remoteMessage, true);
        }
    });

    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log("Message handled in the background!", remoteMessage);
      if (!this.navigation) {
          this.pendingNotification = remoteMessage;
        } else {
          this.handleRemoteMessage(remoteMessage, true);
        }
    });

    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log("A new FCM message arrived!", remoteMessage);
      const kt = await this.requestUserPermission();
      console.log("Permission status:", kt);
      if (!this.navigation) {
          this.pendingNotification = remoteMessage;
        } else {
          this.handleRemoteMessage(remoteMessage, false);
        }
    });

    return unsubscribe; // Hủy đăng ký khi component bị unmount
  }

  static async deleteTokenFromSecureStore() {
    try {
      await SecureStore.deleteItemAsync("fcm_token");
      console.log("FCM token deleted from secure store");
    } catch (error) {
      console.error("Error deleting FCM token from secure store:", error);
    }
  }
}

export default FCM;
