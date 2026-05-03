import Colors from '@/src/constants/Color';
import apiClient from '@/src/networking/apiclient';
import ProfileService from '@/src/services/profile.service';
import TokenService from '@/src/services/token.service';
import { Ionicons } from "@expo/vector-icons";
import { NavigationProp } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Image, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import styles from './styles';

interface Driver {
  id: number;
  name: string;
  phone: string;
  avatar?: string;
}

interface Trip {
  startLocation: string;
  destination: string;
  departureTime: string;
  driver: Driver;
  isBlocked: boolean;
}

type Props = {
  navigation: NavigationProp<any>;
};

const TripHistory : React.FC<Props> = ({ navigation }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const getUserId = async () => {
      const id = await ProfileService.getUserId();
      setUserId(id);
    };
    getUserId();
  }, []);

  function formatDateTime(date: Date | string | null) {
    if (!date) return '';
    const dt = typeof date === 'string' ? new Date(date) : date;
    if (!(dt instanceof Date) || isNaN(dt.getTime())) return '';
    return dt.toLocaleTimeString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      //timeZone: 'UTC',
    });
  }  

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const accessToken = await TokenService.getAccessToken();
        const response = await apiClient.get('/trip/history', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        console.log('Trip history response:', response.data);
        setTrips(response.data);
        console.log(formatDateTime(response.data[0]?.departureTime));
      } catch (error) {
        Alert.alert('Error', 'Could not fetch trip history.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleBlock = async (driverId: number) => {
    // Cập nhật trạng thái isBlocked cho trip có driverId tương ứng
    try {
      const accessToken = await TokenService.getAccessToken();
      await apiClient.post(
        `/blackList`,
        { blockedId: driverId }, // <-- truyền id tài xế bị chặn ở đây
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setTrips(prevTrips =>
        prevTrips.map(trip =>
          trip.driver.id === driverId ? { ...trip, isBlocked: true } : trip
        )
      );
    } catch (error) {
      Alert.alert('Error', 'Could not block driver.');
      console.error(error);
    }
  };

  const renderItem = ({ item }: { item: Trip }) => (
            <View style={styles.tripCard}>
              <Text style={styles.tripDesc1}>Khởi hành: {formatDateTime(item.departureTime)}</Text>
              <Text style={styles.tripDesc2}>Tài xế: {item.driver.name}</Text>
              <View style={{ flexDirection: 'row', marginTop: 8 }} >
                <Image
                  source={(item.driver.avatar) ? { uri: item.driver.avatar } : require('./../../assets/user1.png')}
                  style={styles.driverAvt}
                />
                <View style={{ flexDirection: 'column', justifyContent: 'space-between', borderRadius: 10, marginLeft: 10 }} >
                  <View style={{ flexDirection: 'row', alignItems: 'center'}}>
                    <View style={{height: 10, width: 10, borderRadius: 10, backgroundColor: Colors.secondary_background, marginRight: 8}}/>
                    <Text style={styles.tripTitle}>Từ {item.startLocation}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center'}}>
                    <View style={{height: 10, width: 10, borderRadius: 10, backgroundColor: Colors.blue, marginRight: 8}}/>
                    <Text style={styles.tripTitle}>Đến {item.destination}</Text>
                  </View>
                </View>
              </View>
              <View style={{ flex: 1,flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <TouchableOpacity style = {{flexDirection: 'row', alignItems: 'center'}}>
                  <Text style={styles.driverLink}>SĐT: {item.driver.phone} </Text>
                </TouchableOpacity>
                {userId !== item.driver.id && (
                  <TouchableOpacity
                    style={[styles.blockButton, item.isBlocked && { backgroundColor: '#dddddd' }]}
                    onPress={() => handleBlock(item.driver.id)}
                    disabled={item.isBlocked}
                  >
                  <Text style={styles.createTripButtonText}>{item.isBlocked ? 'Đã chặn' : 'Chặn tài xế'}</Text>
                </TouchableOpacity> 
                )}               
              </View>
            </View>
  );


  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.6}>
            <Ionicons name="arrow-back" size={26} color="gray" />
          </TouchableOpacity>
          <Text style={styles.title}>Lịch sử chuyến đi</Text>
        </View>
      <FlatList
        data={trips}
        style={styles.tripList}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

export default TripHistory;
