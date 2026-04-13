import apiClient from '@/src/networking/apiclient';
import TokenService from '@/src/services/token.service';
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from 'react';
import { FlatList, Image, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import styles from './styles';

type Props = {
    navigation: any;
};

interface BlockedUser {
  id: number;
  email: string;
  isActivated: boolean;
  createdAt: string; // Hoặc Date nếu bạn xử lý
  name: string | null;
  urlPublicAvatar: string | null;
  phone: string | null;
}

const BlackList: React.FC<Props> = ({ navigation }) => {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const fetchBlockedUsers = async () => {
    try {
      const accessToken = await TokenService.getAccessToken();
      const response = await apiClient.get(`/blackList`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setBlockedUsers(response.data);
    } catch (error) {
      console.error('Error fetching blocked users:', error);
    }
  };

  const handleToggleBlock = async (userId: number) => {
    try {
      const accessToken = await TokenService.getAccessToken();
      await apiClient.delete('/blackList', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        data: { blockedId: userId },
      });
      fetchBlockedUsers();
    } catch (error) {
      console.error('Error toggling block status:', error);
    }
  };

  const renderItem = ({ item }: { item: BlockedUser }) => (
    <View style={styles.card}>
      <Image
        source={(item.urlPublicAvatar) ? { uri: item.urlPublicAvatar } : require('./../../assets/user1.png')}
        style={styles.driverAvt}
      />
      <View style={styles.userInfo}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={{ flexDirection: 'row', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 1, backgroundColor: "#bbecff", borderRadius: 5 }} >
          <Text style={styles.phone}>SĐT: {item.phone || 'Chưa có số điện thoại'}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => handleToggleBlock(item.id)}
      >
        <Text style={styles.buttonText}>Bỏ chặn</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.6}>
          <Ionicons name="arrow-back" size={26} color="gray" />
        </TouchableOpacity>
        <Text style={styles.title}>Danh sách người bị chặn</Text>
      </View>
      <FlatList
        style={styles.blockList}
        data={blockedUsers}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
      />
    </View>
  );
};

export default BlackList;
