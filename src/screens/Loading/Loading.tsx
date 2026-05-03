import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { navigationRef } from '../../navigation/NavigationService';
import ProfileApi from '../../networking/profile.api';
import ProfileService from '../../services/profile.service';
// import { connectSocket } from '../../utils/socket';
// import { FCM } from '../../services/fcm';

const Loading: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await ProfileApi.getProfile();
        await ProfileService.saveProfile(response);

        // await connectSocket();

        // Reset điều hướng
        if (navigationRef.isReady()) {
          console.log('Response:', response);
          navigationRef.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });

          // Sau khi navigation sẵn sàng, xử lý thông báo
          // FCM.handlePendingNotificationIfAny();
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // FCM.initializeFCM(); // Khởi tạo Firebase Messaging
    loadData();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {isLoading ? (
        <>
          <ActivityIndicator size="large" color="#007BFF" />
          <Text style={{ marginTop: 10, fontSize: 16, color: '#555' }}>Đang tải dữ liệu...</Text>
        </>
      ) : (
        <Text style={{ fontSize: 16, color: '#555' }}>Đã tải xong!</Text>
      )}
    </View>
  );
};

export default Loading;