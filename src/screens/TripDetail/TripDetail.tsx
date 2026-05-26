import Colors from '@/src/constants/Color';
import apiClient from '@/src/networking/apiclient';
import ProfileService from '@/src/services/profile.service';
import TokenService from '@/src/services/token.service';
import { Trip } from '@/src/types/fixedtrip.types';
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { NavigationProp, useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Image, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import io from 'socket.io-client';

type TripDetailRouteParams = {
  trip: Trip;
};

type Props = {
    navigation: NavigationProp<any>;
    route: any; 
};

const locations = ['GĐ2', 'G2', 'GĐ3', 'GĐ4', 'E3','E5', 'G3'];
const slots = ['1', '2', '3', '4', '5', '6', '7'];

const TripDetail: React.FC<Props> = ({ navigation, route }) => {
  // Nhận dữ liệu chuyến đi từ params
  const [trip, setMyTrip] = useState<Trip | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  // States for creating a new trip
  const [newFrom, setNewFrom] = useState('');
  const [newTo, setNewTo] = useState('');
  const [newDepartureTime, setNewDepartureTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [newSlot, setNewSlot] = useState('');

  const handleTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || newDepartureTime;
    setShowTimePicker(Platform.OS === 'ios');
    setNewDepartureTime(currentDate);
  };

  function buildDepartureTime(date: Date) {
    return date.toISOString();
  }

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

  // Hàm tạo chuyến
  const handleCreateTrip = async () => {
    if (!newFrom || !newTo || !newSlot) {
      alert('Vui lòng chọn đầy đủ điểm đi, điểm đến, giờ và số chỗ!');
      return;
    }
    try {
      const accessToken = await TokenService.getAccessToken();
      await apiClient.post('/trip', {
        slot: Number(newSlot),
        startLocation: newFrom,
        destination: newTo,
        departureTime: buildDepartureTime(newDepartureTime),
      }, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      alert('Tạo chuyến đi thành công!');
      fetchMyTrip(); // Fetch the new trip
    } catch (error) {
      alert('Tạo chuyến đi thất bại!');
      console.error(error);
    }
  };

  // Hàm lấy chuyến đi của mình
  const fetchMyTrip = async () => {
    try {
      const accessToken = await TokenService.getAccessToken();
      const userId = await ProfileService.getUserId(); // Lấy userId là số
      const response = await apiClient.get(`/trip/${userId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.data;
      setMyTrip(data);
    } catch (error) {
      const err: any = error;
      if (err?.response?.status === 404) {
        setMyTrip(null); // Không có chuyến đi, không báo lỗi
      } else {
        console.error('Lỗi khi lấy chuyến đi của bạn:', error);
      }
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      setUserId(route.params?.userId);
      fetchMyTrip();
    }, [route.params?.userId])
  );

  //lắng nghe realtime qua socket.io
  useEffect(() => {
    if (trip && userId) {
    const socket = io(process.env.EXPO_PUBLIC_API_URL ?? '', { transports: ['websocket'] });

    // Tham gia room chuyến đi
    socket.emit('joinTripRoom', { tripId: String(trip.id), userId: String(userId) });

    // Khi có khách mới tham gia chuyến mà chưa đưuọc duyệt (gửi cho riêng tài xế)
    socket.on('newCustomerAdded', (data: { customerId?: number; tripId?: number }) => {
      // Nếu chỉ có customerId: thông báo cho cả room
      // Nếu có cả tripId và customerId: thông báo riêng cho tài xế
      console.log('Khách mới:', data);
      alert(`Khách hàng mới đã đăng ký tham gia chuyến.`);
      refreshTrip();
      // TODO: Gọi API hoặc cập nhật lại UI nếu cần
    });

    // Khi tài xế duyệt khách, chỉ gửi cho user được duyệt
    socket.on('approvedToTrip', () => {
      console.log('Bạn đã được duyệt vào một chuyến đi.');
      alert('Bạn đã được duyệt vào chuyến đi!');
      refreshTrip();
      // TODO: Gọi API hoặc cập nhật lại UI nếu cần
    });

    // Khi có hành khách được tự động duyệt gửi cho cả room
    socket.on('userAutoApproved', (data: {tripId: string; userId: string }) => {
      console.log(userId, data.userId);
      refreshTrip();
      // TODO: Điều hướng về trang khác nếu cần
    });

    // Khi có hành khách được tự động duyệt gửi cho cả room
    socket.on('userApproved', (data: {tripId: string; userId: string }) => {
      console.log(userId, data.userId);
      refreshTrip();
      // TODO: Điều hướng về trang khác nếu cần
    });

    // Khi chuyến bị hủy, gửi cho cả room
    socket.on('tripCanceled', (data: { message: string; tripId: string; userId: string }) => {
      console.log(userId, data.userId);
      if(userId.toString() !=  data.userId) alert(data.message);
      if(userId.toString() != data.userId) navigation.navigate('Home', { tripOut: true });
      // TODO: Điều hướng về trang khác nếu cần
    });

    // Khi chuyến hoàn thành, gửi cho cả room
    socket.on('tripCompleted', (data: { message: string; tripId: string; userId: string }) => {
      console.log(userId, data.userId);
      if(userId.toString() !=  data.userId) alert(data.message);
      if(userId.toString() != data.userId) navigation.navigate('Home', { tripOut: true });
      // TODO: Điều hướng về trang khác nếu cần
    });

    // Khi rời chuyến gửi cho cả room
    socket.on('tripOut', (data: { message: string; tripId: string; userId: string }) => {
      if(userId.toString() != data.userId) alert(data.message);
      refreshTrip();
      // TODO: Điều hướng về trang khác nếu cần
    });    

    // Cleanup khi unmount
    return () => {
      socket.disconnect();
    };
    }
  }, [trip, userId]);

  if (trip == null) {
    return (
      <View style={styles.container}>
        <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.6}>
            <Ionicons name="arrow-back" size={26} color="gray" />
          </TouchableOpacity>
          <Text style={styles.title}>Bạn chưa có chuyến đi nào</Text>
        </View>

        <Text style={styles.sectionTitle}>TẠO CHUYẾN ĐI MỚI</Text>
        
        <View style={styles.createTripContainer}>
          {/* From */}
          <View style={styles.pickerWrapper}>
            <Text style={styles.label}>Điểm đi</Text>
            <Picker selectedValue={newFrom} onValueChange={setNewFrom} style={styles.picker}>
              <Picker.Item label="Chọn điểm đi" value="" />
              {locations.map(loc => <Picker.Item key={loc} label={loc} value={loc} />)}
            </Picker>
          </View>

          {/* To */}
          <View style={styles.pickerWrapper}>
            <Text style={styles.label}>Điểm đến</Text>
            <Picker selectedValue={newTo} onValueChange={setNewTo} style={styles.picker}>
              <Picker.Item label="Chọn điểm đến" value="" />
              {locations.map(loc => <Picker.Item key={loc} label={loc} value={loc} />)}
            </Picker>
          </View>

          {/* Hour */}
          <View style={styles.pickerWrapper}>
            <Text style={styles.label}>Giờ khởi hành</Text>
            <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.timePickerButton}>
              <Text style={styles.timePickerButtonText}>
                {newDepartureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={newDepartureTime}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={handleTimeChange}
              />
            )}
          </View>

          {/* Slot */}
          <View style={styles.pickerWrapper}>
            <Text style={styles.label}>Số chỗ</Text>
            <Picker selectedValue={newSlot} onValueChange={setNewSlot} style={styles.picker}>
              <Picker.Item label="Chọn số chỗ" value="" />
              {slots.map(s => <Picker.Item key={s} label={s} value={s} />)}
            </Picker>
          </View>

          <TouchableOpacity style={styles.createTripButton} onPress={handleCreateTrip}>
            <Text style={styles.createTripButtonText}>Tạo chuyến</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Kiểm tra vai trò
  const isDriver = userId === trip.driver.id;

  // Dummy handlers
  const handleApprove = async (customerId: number) => {
    try {
      if(trip.approvedCustomers.length >= trip.slot) {
        alert('Số khách đã đủ, không thể duyệt thêm!');
        return;
      }
      const accessToken = await TokenService.getAccessToken();
      console.log('Duyệt khách hàng ID:', customerId, 'cho chuyến ID:', trip.id);
      const response = await apiClient.post(
        `/trip/${trip.id}/approve/${customerId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      // Sau khi duyệt thành công, nên gọi lại API lấy trip mới hoặc cập nhật state
      // setMyTrip(response.data.trip); // Cập nhật trip mới từ response
      fetchMyTrip(); // Gọi lại hàm để lấy dữ liệu trip đầy đủ
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Duyệt khách hàng thất bại!');
    }
  };
  
  // Hàm lấy lại dữ liệu trip
  const refreshTrip = async () => {
    fetchMyTrip();
  };

  const handleOutTrip = async () => {
    try {
      const accessToken = await TokenService.getAccessToken();
      const response = await apiClient.post(
        `/trip/${trip.id}/out`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      alert(response.data.message || 'Bạn đã rời chuyến');
      navigation.navigate('Home', { tripOut: true });
      // Nên gọi lại API lấy trip mới hoặc điều hướng về màn hình khác
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Rời chuyến thất bại!');
      console.error('Lỗi rời chuyến:', error);
    }
  };

  const handleCancelTrip = async () => {
    try {
      const accessToken = await TokenService.getAccessToken();
      const response = await apiClient.delete(
        `/trip/${trip.id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      // navigation.goBack();
      navigation.navigate('Home', { tripOut: true });
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Hủy chuyến thất bại!');
      console.error('Lỗi hủy chuyến:', error);
    }
  };


  const handleCompleteTrip = async () => {
    try {
      const accessToken = await TokenService.getAccessToken();
      const response = await apiClient.patch(
        `/trip/${trip.id}/complete`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      alert(response.data.message || 'Chuyến đi đã được hoàn thành!');
      navigation.navigate('Home', { tripOut: true });
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Hoàn thành chuyến đi thất bại!');
      console.error('Lỗi hoàn thành chuyến đi:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Home', { trip: trip })} style={styles.backButton} activeOpacity={0.6}>
          <Ionicons name="arrow-back" size={26} color="gray" />
        </TouchableOpacity>
        <Text style={styles.title}>Chuyến đi</Text>
      </View>
      <Text style={styles.sectionTitle}>THÔNG TIN CHUYẾN ĐI</Text>
            <View style={styles.tripCard}>
              <Text style={styles.tripDesc1}>Khởi hành: {trip.dayOfWeek}, {formatDateTime(trip.departureTime)}</Text>
              <Text style={styles.tripDesc2}>Tài xế: {trip.driver.profile.name}</Text>
              <View style={{ flexDirection: 'row', marginTop: 8 }} >
                <Image
                  source={(trip.driver.profile.urlPublicAvatar) ? { uri: trip.driver.profile.urlPublicAvatar } : require('./../../assets/user1.png')}
                  style={styles.driverAvt}
                />
                <View style={{ flexDirection: 'column', justifyContent: 'space-between', borderRadius: 10, marginLeft: 10 }} >
                  <View style={{ flexDirection: 'row', alignItems: 'center'}}>
                    <View style={{height: 10, width: 10, borderRadius: 10, backgroundColor: Colors.secondary_background, marginRight: 8}}/>
                    <Text style={styles.tripTitle}>Từ {trip.startLocation}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center'}}>
                    <View style={{height: 10, width: 10, borderRadius: 10, backgroundColor: Colors.blue, marginRight: 8}}/>
                    <Text style={styles.tripTitle}>Đến {trip.destination}</Text>
                  </View>
                </View>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, paddingHorizontal: 4 }}>
                  <Text style={styles.driverLink}>SĐT: {trip.driver.profile.phone} </Text>
                  <Text style={styles.driverLink}>Số chỗ: {trip.slot}</Text>        
              </View>
              <TouchableOpacity style={styles.messageBtn} onPress={() => navigation.navigate('Message')}>
                <Text style={styles.completeBtnText}>Tin nhắn</Text>
              </TouchableOpacity>
            </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hành khách đã duyệt</Text>
        {trip?.approvedCustomers.length === 0 && <Text style={styles.empty}>Chưa có hành khách nào được duyệt</Text>}
        {trip?.approvedCustomers.map((u) => (
          <View key={u.id} style={styles.userRow}>
            <View style={{ flexDirection: 'row' }} >
              <Image
                  source={(u.profile.urlPublicAvatar) ? { uri: u.profile.urlPublicAvatar } : require('./../../assets/user1.png')}
                  style={styles.driverAvt}
              />
              <View style={{ flexDirection: 'column', justifyContent: 'space-between', borderRadius: 10, marginLeft: 10, alignItems: 'flex-start' }} >
                  <View style={{ flexDirection: 'row', alignItems: 'center'}}>
                    <View style={{height: 10, width: 10, borderRadius: 10, backgroundColor: Colors.secondary_background, marginRight: 8}}/>
                    <Text style={styles.customerProfile}>Tên: {u.profile.name}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center'}}>
                    <View style={{height: 10, width: 10, borderRadius: 10, backgroundColor: Colors.blue, marginRight: 8}}/>
                    <Text style={styles.customerProfile}>SĐT: {u.profile.phone}</Text>
                  </View>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hành khách chờ duyệt</Text>
        {trip?.customers.length === 0 && <Text style={styles.empty}>Không có hành khách chờ duyệt</Text>}
        {trip?.customers.map((u) => (
          <View key={u.id} style={styles.userRow}>
            <View style={{ flexDirection: 'row' }} >
              <Image
                  source={(u.profile.urlPublicAvatar) ? { uri: u.profile.urlPublicAvatar } : require('./../../assets/user1.png')}
                  style={styles.driverAvt}
              />
              <View style={{ flexDirection: 'column', justifyContent: 'space-between', borderRadius: 10, marginLeft: 10, alignItems: 'flex-start' }} >
                  <View style={{ flexDirection: 'row', alignItems: 'center'}}>
                    <View style={{height: 10, width: 10, borderRadius: 10, backgroundColor: Colors.secondary_background, marginRight: 8}}/>
                    <Text style={styles.customerProfile}>Tên: {u.profile.name}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center'}}>
                    <View style={{height: 10, width: 10, borderRadius: 10, backgroundColor: Colors.blue, marginRight: 8}}/>
                    <Text style={styles.customerProfile}>SĐT: {u.profile.phone}</Text>
                  </View>
              </View>
            </View>
            {isDriver == true && (
              <TouchableOpacity style={{backgroundColor: Colors.secondary_background, padding:5, borderRadius: 10, alignItems: 'center'}} onPress={() => handleApprove(u.id)}>
                <Text style={[styles.completeBtnText, { fontSize: 14 }]}>Duyệt</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      {isDriver == true ? (
        <View style={{ flexDirection: 'row', justifyContent: 'center'}}>  
          <TouchableOpacity style={styles.completeBtn} onPress={handleCompleteTrip}>
            <Text style={styles.completeBtnText}>Hoàn thành</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.completeBtn, { backgroundColor: '#dbdbdb' }]} onPress={handleCancelTrip}>
            <Text style={styles.completeBtnText}>Hủy chuyến</Text>
          </TouchableOpacity>
        </View>
      ) : (
          <TouchableOpacity style={[styles.messageBtn, {marginHorizontal: 8}]} onPress={handleOutTrip}>
            <Text style={styles.completeBtnText}>Rời chuyến</Text>
          </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: -26,
    color: Colors.primary_background,
  },
  header: {
    backgroundColor: '#ffd900',
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 30,
    paddingTop: '11%',
    borderBottomWidth: 1,
    borderBottomColor: '#e7e7e7',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
    fontSize: 26,
    zIndex: 2,
  },
  createTripContainer: {
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 18,
    elevation: 2,
  },
  pickerWrapper: {
    marginBottom: 12,
  },
  picker: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  timePickerButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  timePickerButtonText: {
    fontSize: 16,
  },
  createTripButton: {
    backgroundColor: Colors.secondary_background,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  createTripButtonText: {
    color: Colors.primary_background,
    fontWeight: 'bold',
    fontSize: 16,
  },
  tripCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 10,
    width: '100%',
    alignSelf: 'stretch',

    borderRadius: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4, // Android
  },
  tripTitle: { fontSize: 16 },
  tripDesc1: { fontSize: 13, color: '#666' },
  tripDesc2: { fontSize: 16, color: Colors.primary_background, marginTop: 2 , fontWeight: 'bold'},
  customerProfile: { fontSize: 15, color: Colors.primary_background , fontWeight: 'bold'},
  driverAvt: {
    width: 45, 
    height: 45, 
    marginRight: 4, 
    borderRadius: 10, 
    backgroundColor: Colors.background_avatar,
    resizeMode: 'contain', 
  },
  driverLink: {
    color: '#535353',
    fontSize: 14,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    color: Colors.primary_background,
  },
  value: {
    fontWeight: 'normal',
    color: '#1976d2',
  },
  section: {
    marginBottom: 18,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#838383',
    marginHorizontal: 8,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'space-between',
    backgroundColor: '#fff5d4',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: Colors.secondary_background,
  },
  userText: {
    fontSize: 15,
    color: '#444',
  },
  approveBtn: {
    backgroundColor: '#43a047',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 8,
  },
  approveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  outBtn: {
    backgroundColor: '#e53935',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 8,
  },
  outBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  empty: {
    color: '#888',
    fontStyle: 'italic',
    marginLeft: 8,
  },
  completeBtn: {
    backgroundColor: Colors.secondary_background,
    padding: 8,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginHorizontal: 8,
    flex: 1,
  },
  messageBtn: {
    backgroundColor: Colors.secondary_background,
    padding: 8,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  completeBtnText: {
    color: Colors.primary_background,
    fontWeight: 'bold',
    fontSize: 16,
  },

});

export default TripDetail;
