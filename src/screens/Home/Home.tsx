import Colors from '@/src/constants/Color';
import apiClient from '@/src/networking/apiclient';
import ProfileService from '@/src/services/profile.service';
import TokenService from '@/src/services/token.service';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker'; // Cần cài: npm install @react-native-picker/picker
import { NavigationProp, useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, ImageBackground, Platform, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { io } from 'socket.io-client';
import styles from './styles';

type Trip = {
  id: number;
  slot: number;
  departureTime: string;
  startLocation: string;
  destination: string;
  status: string;
  driver: {
    id: number;
    email: string;
    name: string;
    avatar: string;
    phone: string;
  };
  customerIds: number[];
};
    

type Props = {
  navigation: NavigationProp<any>;
  route: any; 
};

const locations = ['GĐ2', 'G2', 'GĐ3', 'GĐ4', 'E3','E5', 'G3'];

const Home: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(''); // của người dùng
  const [userId, setUserId] = useState<number | null>(null);

  const [from, setFrom] = useState(''); // của bộ lọc 
  const [to, setTo] = useState(''); // của bộ lọc
  const [newDepartureTime, setNewDepartureTime] = useState(new Date());

  const [TripsData, setTripsData] = useState<Trip[]>([]); // danh sách chuyến đi
  const [myTrip, setMyTrip] = useState<Trip | null>(null); // chuyến đi của mình

  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    const getUserId = async () => {
      const id = await ProfileService.getUserId();
      setUserId(id);
    };
    getUserId();
  }, []);

// lắng nghe realtime qua socket.io
useEffect(() => {
  if (userId) {
    const socket = io(process.env.EXPO_PUBLIC_API_URL ?? '', { transports: ['websocket'] });
    const abortController = new AbortController();
    const signal = abortController.signal;

    // Ngay sau khi kết nối, gửi userId của bạn lên server để đăng ký
    socket.on('connect', () => {
      socket.emit('registerUser', { userId: String(userId)});
      if(myTrip) socket.emit('joinTripRoom', { tripId: String(myTrip.id), userId: String(userId) });
    });

    // Lắng nghe sự kiện 'approvedToTrip'
    socket.on('approvedToTrip', () => {
      console.log('Bạn đã được duyệt vào một chuyến đi.');
      alert('Bạn đã được duyệt vào chuyến đi đã đăng ký!');
      fetchMyTrip(signal); // Cập nhật lại chuyến đi của bạn
    });

    // Khi chuyến bị hủy, gửi cho cả room
    socket.on('tripCanceled', (data: { message: string; tripId: string; userId: string }) => {
      setMyTrip(null); // Cập nhật lại chuyến đi của bạn
      console.log(userId, data.userId);
      if(userId.toString() != data.userId) alert(data.message);
      // TODO: Điều hướng về trang khác nếu cần
    });

    // Khi chuyến bị hủy, gửi cho cả room
    socket.on('tripCompleted', (data: { message: string; tripId: string; userId: string }) => {
      setMyTrip(null); // Cập nhật lại chuyến đi của bạn
      console.log(userId, data.userId);
      if(userId.toString() != data.userId) alert(data.message);
      
      // TODO: Điều hướng về trang khác nếu cần
    });

    // Cleanup khi unmount
    return () => {
      abortController.abort();
      socket.disconnect();
    };
  }
}, [userId, myTrip]); // Chỉ cần phụ thuộc vào userId

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

  const handleTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || newDepartureTime;
    setShowTimePicker(Platform.OS === 'ios');
    setNewDepartureTime(currentDate);
  };
  
  //Hàm tìm kiếm với bộ lọc
  const handleFilter = async () => {
    if (from === '' || to === '') {
      alert('Vui lòng chọn đầy đủ điểm đi và điểm đến!');
      return;
    }
    try {
      const accessToken = await TokenService.getAccessToken();
      // Gửi dữ liệu lọc lên backend
      const response = await apiClient.post('/trip/findTrip', {
        startLocation: from,
        destination: to,
        date: newDepartureTime.toISOString(),
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.data;
      setTripsData(data); // cập nhật lại danh sách chuyến đi
    } catch (error) {
      console.error('Lỗi khi lọc chuyến đi:', error);
    }
  };

  // Hàm lấy chuyến đi của mình
  const fetchMyTrip = async (signal?: AbortSignal) => {
    try {
      const accessToken = await TokenService.getAccessToken();
      const userId = await ProfileService.getUserId(); // Lấy userId là số
      if (!userId) return;
      const response = await apiClient.get(`/trip/${userId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        signal, // Truyền abort signal vào apiClient
      });
      const data = await response.data;
      setMyTrip(data);
    } catch (error) {
      const err: any = error;
      if (err.name === 'CanceledError') {
        console.log('Yêu cầu fetchMyTrip đã bị hủy.');
        return;
      }
      if (err?.response?.status === 404) {
        setMyTrip(null); // Không có chuyến đi, không báo lỗi
      } else {
        console.error('Lỗi khi lấy chuyến đi của bạn:', error);
      }
    }
  };

  //Hàm lấy tên và ảnh đại diện của người dùng
  const fetchUserProfile = async (signal?: AbortSignal) => {
    try {
      const Name = await ProfileService.getName(); 
      console.log("User name:", Name); 
      setName(Name|| ''); // Nếu không lấy được tên, để trống
    } catch (error) {
      const err: any = error;
      if (err.name === 'CanceledError') {
        console.log('Yêu cầu fetchUserProfile đã bị hủy.');
      } else {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      const tripOut = route.params?.tripOut;
      if (tripOut) {
        //console.log('Đã nhận được tripOut param, cập nhật lại dữ liệu...:', tripOut);
        setMyTrip(null); 
        navigation.setParams({ tripOut: undefined });
      }
    }, [route.params?.tripOut])
  );

  useFocusEffect(
    useCallback(() => {
      const trip = route.params?.trip;
      if (trip) {
        setMyTrip(trip);
        navigation.setParams({ trip: undefined });
      }
    }, [route.params?.trip])
  );
  
  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;
    fetchUserProfile(signal);
    fetchMyTrip(signal);
    fetchTrips(signal);

    return () => {
      abortController.abort(); // Hủy các request khi component unmount
    };
  }, []); // Chỉ chạy một lần khi component mount

  // Lấy dữ liệu các chuyến đi từ backend khi mở trang
  const fetchTrips = async (signal?: AbortSignal) => {
    try {
      // Ví dụ gọi API, thay bằng API thật của bạn
        const accessToken = await TokenService.getAccessToken();
        const response = await apiClient.get(`/trip`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        signal, // Truyền abort signal vào apiClient
      });
      const data = await response.data;
      setTripsData(data);
      // setFilteredTrips(data); // Hiển thị toàn bộ ban đầu
    } catch (error) {
      const err: any = error;
      if (err.name === 'CanceledError') {
        console.log('Yêu cầu fetchTrips đã bị hủy.');
      } else {
        console.error('Lỗi khi lấy danh sách chuyến đi:', error);
      }
    }
  };

  //hàm tham gia chuyến đi
  const joinTrip = async (tripId: number) => {
    if(myTrip != null){
      alert('Bạn chỉ được tham gia một chuyến đi tại một thời điểm!');
      return;
    }
    try {
      const accessToken = await TokenService.getAccessToken();
      const response = await apiClient.post(`/trip/${tripId}/join`, {}, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      removeTripById(tripId); // Cập nhật lại danh sách chuyến đi
    } catch (error : any) {
      alert(error.response?.data?.message || 'Tham gia chuyến đi thất bại!');
    }
  };

  //hàm xóa một chuyến đi khỏi danh sách
  const removeTripById = (id: number) => {
    setTripsData(prevTrips => prevTrips.filter(trip => trip.id !== id));
  };

  
  return (
    <ImageBackground 
      source={require('./../../assets/HomeBackground.png')} // 'background.png' 
      style={{flex: 1}}
      resizeMode="cover"
    >
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Khung ảnh người dùng */}
        <View style={styles.profileContainer}>
          <Text style={styles.username}>Chào {name} !</Text>
        </View>

      {/* Bộ lọc chuyến đi */}
      <View style={styles.filterContainer}>
        {/* Hàng 1: Điểm đi và điểm đến */}
        <View style={styles.filterRow}>
          <View style={styles.pickerWrapper}>
            
            <View style={{ flexDirection: 'row' }}>
              {/* Ảnh minh họa*/}
              <Image
                source={require('./../../assets/location_yellow.png')}
                style={styles.filterIcons}
                resizeMode="contain"
              />
              <Text style={styles.filterLabel}>Điểm đi</Text>
            </View>
            <View style={styles.pickerRow}>
              {from ? <Text style={styles.selectedValue}>{from}</Text> : null}
              <Picker
                selectedValue={from}
                style={[styles.picker, { color: 'transparent' }]}
                onValueChange={setFrom}
              >
                <Picker.Item label="Đi" value="" />
                {locations.map(loc => (
                  <Picker.Item key={loc} label={loc} value={loc} />
                ))}
              </Picker>
            </View>
          </View>
          <View style={styles.pickerWrapper}>
            <View style={{ flexDirection: 'row' }}>
              {/* Ảnh minh họa, thay đổi source theo ý muốn */}
              <Image
                source={require('./../../assets/location_blue.png')}
                style={styles.filterIcons}
                resizeMode="contain"
              />
              <Text style={styles.filterLabel}>Điểm đến</Text>
            </View>
            <View style={styles.pickerRow}>
              {to ? <Text style={styles.selectedValue}>{to}</Text> : null}
              <Picker
                selectedValue={to}
                style={[styles.picker, { color: 'transparent' }]}
                onValueChange={setTo}
              >
                <Picker.Item label="Đến" value="" />
                {locations.map(loc => (
                  <Picker.Item key={loc} label={loc} value={loc} />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        {/* Hàng 2: Giờ và nút tìm */}
        <View style={[styles.filterRow, { marginTop: 12 }]}>
          <View style={styles.pickerWrapper}>
            <View style={{ flexDirection: 'row' }}>
              {/* Ảnh minh họa, thay đổi source theo ý muốn */}
              <Image
                source={require('./../../assets/watch.png')}
                style={{ ...styles.filterIcons , marginRight:1 , height: 16, width: 16}}
                resizeMode="contain"
              />
              <Text style={styles.filterLabel}>Giờ khởi hành</Text>
            </View>
            <View style={{height: 40, borderRadius: 10, alignItems: 'center', }}>
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
          </View>
          {/* Đặt nút Tìm ở đây */}
          <View style={{ justifyContent: 'flex-end' }}>
              <Text style={[styles.filterLabel, { opacity: 0 }]}>Tìm</Text> 
              <TouchableOpacity style={styles.searchButton} onPress={handleFilter}>
                  <Text style={styles.searchButtonText}>Tìm</Text>
              </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Bảng cuộn các chuyến đi đang có */}
      <Text style={styles.sectionTitle}>Các chuyến hiện có</Text>
      <View style={{
        backgroundColor: Colors.link, 
        borderRadius: 10, flex: 1, 
        overflow: 'hidden',
      }}>
        <FlatList
          data={TripsData}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          style={styles.tripList}
          renderItem={({ item }) => (
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
                <TouchableOpacity style = {{flexDirection: 'row', alignItems: 'center'}} >
                  <Text style={styles.driverLink}>SĐT: {item.driver.phone} </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.createTripButton}
                  onPress={() => joinTrip(item.id)}
                >
                  <Text style={styles.createTripButtonText}>Đăng ký</Text>
                </TouchableOpacity>                
              </View>
            </View>
          )}
        />
      </View>
    </View>
    
    {/* bên trên là phần hiển thị danh sách chuyến đi, bên dưới là phần 4 nút chức năng chính ở cuối trang */}
    <ImageBackground
      source={require('./../../assets/footer.png')}
      style={styles.buttonRow}
      resizeMode="stretch"
    >
        <TouchableOpacity
          style={styles.chatButton}
          onPress={() => navigation.navigate('TripDetail', { userId: userId })}
        >
          <Image
            source={require('./../../assets/verhicle.png')}
            style={{width: 20, height: 20, resizeMode: 'contain', marginBottom: 4}}
          />
          <Text style={styles.chatButtonText}>Chuyến đi</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.chatButton}
          onPress={() => navigation.navigate('Schedule')}
        >
          <Image
            source={require('./../../assets/schedule.png')}
            style={{width: 19, height: 19, resizeMode: 'contain', marginBottom: 4}}
          />
          <Text style={styles.chatButtonText}>Lịch học</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.chatButton}
          onPress={async () => {
            const userId = await ProfileService.getUserId();
            navigation.navigate('Profile', { userId });
          }}
        >
          <Image
            source={require('./../../assets/profile1.png')}
            style={{width: 18, height: 18, resizeMode: 'contain', marginBottom: 4}}
          />
          <Text style={styles.chatButtonText}>Tài khoản</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.chatButton}
          onPress={() => navigation.navigate('FixedTrip')}
        >
          <Image
            source={require('./../../assets/checklist.png')}
            style={{width: 20, height: 20, resizeMode: 'contain', marginBottom: 4}}
          />
          <Text style={styles.chatButtonText}>Cố định</Text>
        </TouchableOpacity>
    </ImageBackground>
    </ImageBackground>
  );
};

export default Home;