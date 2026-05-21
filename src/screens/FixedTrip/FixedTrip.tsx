import Colors from '@/src/constants/Color';
import { useDebounce } from '@/src/hooks/useDebounce';
import apiClient from '@/src/networking/apiclient';
import ProfileService from '@/src/services/profile.service';
import TokenService from '@/src/services/token.service';
import { ComparedSchedule, FixedTripRequest, Profile } from '@/src/types/fixedtrip.types';
import { Ionicons } from "@expo/vector-icons";
import { NavigationProp } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import styles from './styles';

type Props = {
  navigation: NavigationProp<any>;
};


const FixedTrip : React.FC<Props> = ({ navigation }) => {
  const [comparedSchedules, setComparedSchedules] = useState<ComparedSchedule[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<FixedTripRequest[]>([]);
  const [fixedTrips, setFixedTrips] = useState<FixedTripRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isPage1, setIsPage1] = useState(true);

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const fetchData = useCallback(async () => {
    try {
      const currentUserId = await ProfileService.getUserId();
      if (!currentUserId) {
        Alert.alert("Error", "Could not get user information. Please log in again.");
        return;
      }

      const accessToken = await TokenService.getAccessToken();
      if (!accessToken) {
        Alert.alert("Error", "Authentication token not found. Please log in again.");
        return;
      }
      const headers = { Authorization: `Bearer ${accessToken}` };

      const schedulesUrl = `/schedules/compareWithLastTripDriver?userId=${currentUserId}`;
      const requestsUrl = '/fixed-trip-requests/received';
      const fixedTripsUrl = '/fixed-trip-requests/my-approved-requests';

      const [schedulesResponse, requestsResponse, fixedTripsResponse] = await Promise.all([
        apiClient.get(schedulesUrl, { headers }),
        apiClient.get(requestsUrl, { headers }),
        apiClient.get(fixedTripsUrl, { headers })
      ]);

      setComparedSchedules(schedulesResponse.data);
      // console.log("Compared schedules response: ", schedulesResponse.data);
      setReceivedRequests(requestsResponse.data);
      setFixedTrips(fixedTripsResponse.data);

    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Could not fetch fixed trip data. Please pull down to refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Effect for fetching initial data
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Effect for handling search
  useEffect(() => {
    const searchUsers = async () => {
      if (debouncedSearchQuery.trim().length > 0) {
        setIsSearching(true);
        try {
          const accessToken = await TokenService.getAccessToken();
          const headers = { Authorization: `Bearer ${accessToken}` };
          const url = `/profiles/search?username=${debouncedSearchQuery}`;
          
          console.log('Requesting URL:', apiClient.getUri() + url); // Log URL đầy đủ
          console.log('With Headers:', headers); // Log cả headers

          const response = await apiClient.get<Profile[]>(url, { headers });
          setSearchResults(response.data);
        } catch (error) {
          console.error('Error searching users:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    };

    searchUsers();
  }, [debouncedSearchQuery]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const handleSelectUser = async (selectedUserId: number) => {
    
    const currentUserId = await ProfileService.getUserId();
    console.log("currentUserId: ", currentUserId);
    console.log("selectedUserId: ", selectedUserId);
    if (!currentUserId) {
      Alert.alert("Error", "Could not get user information. Please log in again.");
      return;
    }
    setSearchQuery('');
    setLoading(true); // Show loading indicator for comparison
    try {
      const accessToken = await TokenService.getAccessToken();
      const headers = { Authorization: `Bearer ${accessToken}` };
      const response = await apiClient.get(`/schedules/compare?userId1=${currentUserId}&userId2=${selectedUserId}`, { headers });
      console.log("Comparison response: ", response.data);
      setComparedSchedules(response.data);
    } catch (error) {
      console.error('Error comparing schedules:', error);
      Alert.alert('Error', 'Could not compare schedules.');
    } finally {
      setLoading(false);
      setSearchResults([]);
    }
  };

  const handleRegister = async (schedule: ComparedSchedule) => {
    try {
        const accessToken = await TokenService.getAccessToken();
        if (!accessToken) {
            Alert.alert("Error", "Authentication token not found. Please log in again.");
            return;
        }
        const headers = { Authorization: `Bearer ${accessToken}` };

        const requestData = {
            requesteeId: schedule.driverId,
            requestedDay: schedule.previousSchedule1.dayOfWeek,
            startTime: schedule.previousSchedule1.endTime,
            endTime: schedule.nextSchedule1.startTime,
            startLocation: schedule.previousSchedule1.location,
            destination: schedule.nextSchedule1.location,
        };

        console.log('Sending fixed trip request with data:', requestData);

        await apiClient.post('/fixed-trip-requests', requestData, { headers });
        Alert.alert('Success', 'Đã gửi yêu cầu thành công.');
        onRefresh(); // Refresh data to show updated state
    } catch (error: any) {
        console.error('Error creating fixed trip request:', error.response ? JSON.stringify(error.response.data) : error.message);
        alert(error.response?.data?.message || 'Không thể đăng ký chuyến đi cố định này.');
    }
  };

  const handleApproveRequest = async (requestId: number) => {
    try {
      const accessToken = await TokenService.getAccessToken();
      if (!accessToken) {
        Alert.alert("Error", "Authentication token not found. Please log in again.");
        return;
      }
      const headers = { Authorization: `Bearer ${accessToken}` };

      await apiClient.patch(`/fixed-trip-requests/${requestId}/approve`, {}, { headers });
      Alert.alert('Success', 'Request approved successfully.');
      onRefresh(); // Refresh data
    } catch (error) {
      console.error('Error approving request:', error);
      Alert.alert('Error', 'Could not approve the request.');
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    try {
      const accessToken = await TokenService.getAccessToken();
      if (!accessToken) {
        Alert.alert("Error", "Authentication token not found. Please log in again.");
        return;
      }
      const headers = { Authorization: `Bearer ${accessToken}` };

      await apiClient.patch(`/fixed-trip-requests/${requestId}/reject`, {}, { headers });
      Alert.alert('Success', 'Từ chối yêu cầu thành công.');
      onRefresh(); // Refresh data
    } catch (error) {
      console.error('Error rejecting request:', error);
      Alert.alert('Error', 'Could not reject the request.');
    }
  };

  const handleCancelRequest = async (requestId: number) => {
    try {
      const accessToken = await TokenService.getAccessToken();
      if (!accessToken) {
        Alert.alert("Error", "Authentication token not found. Please log in again.");
        return;
      }
      const headers = { Authorization: `Bearer ${accessToken}` };

      await apiClient.patch(`/fixed-trip-requests/${requestId}/cancel`, {}, { headers });
      Alert.alert('Success', 'Đã xóa lịch cố định thành công.');
      onRefresh(); // Refresh data
    } catch (error) {
      console.error('Error canceling request:', error);
      Alert.alert('Error', 'Could not cancel the request.');
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.6}>
          <Ionicons name="arrow-back" size={26} color="gray" />
        </TouchableOpacity>
        <Text style={styles.title}>Chuyến cố định</Text>
      </View>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm tài xế..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {isSearching && <ActivityIndicator style={styles.searchLoader} />}
      </View>
      <View style={{flexDirection: 'row', paddingBottom: 10, paddingHorizontal: 16, backgroundColor: '#fff'}}>
        <TouchableOpacity style={[styles.tabButton, isPage1 && styles.activeTabButton]}
          onPress={() => setIsPage1(true)}
        >
          <Text style={styles.buttonText}>Đăng ký</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabButton, !isPage1 && styles.activeTabButton]}
          onPress={() => setIsPage1(false)}
        >
          <Text style={styles.buttonText}>Danh sách yêu cầu</Text>
        </TouchableOpacity>
      </View>
      {searchResults.length > 0 ? (
        <View style={{ flex: 1, backgroundColor: Colors.link }}>
        <FlatList
          style={styles.searchResultsContainer}
          data={searchResults}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.searchResultItem} onPress={() => handleSelectUser(item.user.id)}>
                <Image
                  source={(item.urlPublicAvatar) ? { uri: item.urlPublicAvatar } : require('./../../assets/user1.png')}
                  style={styles.Avt}
                />
              <Text style={{fontWeight: 'bold', color: Colors.primary_background}}>{item.username}</Text>
            </TouchableOpacity>
          )}
          keyboardShouldPersistTaps="handled"
        />
        </View>
      ) : (
        <View style={{ flex: 1, backgroundColor: Colors.link }}>
        {isPage1 ? (
          <ScrollView
            style={{ flex: 1, backgroundColor: Colors.link }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.tableContainer}>
              <Text style={styles.title1}>HẸN LỊCH VỚI: <Text style={{ ...styles.title1, fontStyle: 'italic' }}>{comparedSchedules[0]?.driverName?.toUpperCase()}</Text></Text>
              {loading ? <ActivityIndicator style={{ marginTop: 20 }} /> : (
                comparedSchedules.length > 0 ? comparedSchedules.map((item, index) => (
                  <View key={index} style={styles.row}>
                    <View style={{ flex: 1, flexDirection: 'column' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{height: 10, width: 10, borderRadius: 10, backgroundColor: Colors.secondary_background, marginRight: 8}}/>
                        <Text style={styles.filterLabel}>Địa điểm: Từ {item.previousSchedule1.location} đến {item.nextSchedule1.location}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        <View style={{height: 10, width: 10, borderRadius: 10, backgroundColor: Colors.blue, marginRight: 8}}/>
                        <Text style={styles.filterLabel}>Thời gian: {item.previousSchedule1.dayOfWeek}, {item.previousSchedule1.endTime} - {item.nextSchedule1.startTime}</Text>
                      </View>
                    </View>
                    <TouchableOpacity style={styles.button} onPress={() => handleRegister(item)}>
                      <Text style={styles.buttonText}>Đăng ký</Text>
                    </TouchableOpacity>
                  </View>
                )) : <Text style={styles.noDataText}>Không có lịch trùng.</Text>
              )}
            </View>
          </ScrollView>
        ) : (
          <View style={{ flex: 1, backgroundColor: Colors.link }}>
            <View style={{ flex: 1, backgroundColor: Colors.link, borderTopWidth: 1, borderTopColor: '#ccc' }}>
            <Text style={styles.title1}>DANH SÁCH YÊU CẦU ĐĂNG KÝ</Text>
            <ScrollView 
              style={{ flex: 1, backgroundColor: Colors.link }}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.tableContainer}>
                {receivedRequests.length > 0 ? receivedRequests.map((request) => (
                  <View style={styles.tripCard} key={request.id}>
                    <Text style={styles.tripDesc1}>Thời gian: {request.requestedDay}, {request.startTime} - {request.endTime}</Text>
                    <Text style={styles.tripDesc2}>Người gửi: {request.requester.profile.name}</Text>
                    <View style={{ flexDirection: 'row', marginTop: 8 }} >
                      <Image
                        source={(request.requester.profile.urlPublicAvatar) ? { uri: request.requester.profile.urlPublicAvatar } : require('./../../assets/user1.png')}
                        style={styles.driverAvt}
                      />
                      <View style={{ flexDirection: 'column', justifyContent: 'space-between', borderRadius: 10, marginLeft: 10 }} >
                        <View style={{ flexDirection: 'row', alignItems: 'center'}}>
                          <View style={{height: 10, width: 10, borderRadius: 10, backgroundColor: Colors.secondary_background, marginRight: 8}}/>
                          <Text style={styles.tripTitle}>Từ {request.startLocation}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center'}}>
                          <View style={{height: 10, width: 10, borderRadius: 10, backgroundColor: Colors.blue, marginRight: 8}}/>
                          <Text style={styles.tripTitle}>Đến {request.destination}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={{ flex: 1,flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <TouchableOpacity style = {{flexDirection: 'row', alignItems: 'center'}} >
                        <Text style={styles.driverLink}>SĐT: {request.requester.profile.phone} </Text>
                      </TouchableOpacity>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent:'flex-end' }}>
                        <TouchableOpacity
                          style={[styles.createTripButton, {backgroundColor: '#dbdbdb'}]}
                          onPress={() => handleRejectRequest(request.id)}
                        >
                          <Text style={styles.createTripButtonText}>Từ chối</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.createTripButton}
                          onPress={() => handleApproveRequest(request.id)}
                        >
                          <Text style={styles.createTripButtonText}>Chấp nhận</Text>
                        </TouchableOpacity>
                      </View>                   
                    </View>
                  </View>
                )) : <Text style={styles.noDataText}>Bạn chưa nhận được yêu cầu nào.</Text>}
              </View>
            </ScrollView>
            </View>
          
            <View style={{ flex: 1, backgroundColor: Colors.link, borderTopWidth: 1, borderTopColor: '#ccc' }}>
            <Text style={styles.title1}>DANH SÁCH ĐÃ DUYỆT</Text>
            <ScrollView 
              style={{ flex: 1, backgroundColor: Colors.link }}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.tableContainer}>
                {fixedTrips.length > 0 ? fixedTrips.map((request) => (
                  <View style={styles.tripCard} key={request.id}>
                    <Text style={styles.tripDesc1}>Thời gian: {request.requestedDay}, {request.startTime} - {request.endTime}</Text>
                    <Text style={styles.tripDesc2}>Người gửi: {request.requester.profile.name}</Text>
                    <View style={{ flexDirection: 'row', marginTop: 8 }} >
                      <Image
                        source={(request.requester.profile.urlPublicAvatar) ? { uri: request.requester.profile.urlPublicAvatar } : require('./../../assets/user1.png')}
                        style={styles.driverAvt}
                      />
                      <View style={{ flexDirection: 'column', justifyContent: 'space-between', borderRadius: 10, marginLeft: 10 }} >
                        <View style={{ flexDirection: 'row', alignItems: 'center'}}>
                          <View style={{height: 10, width: 10, borderRadius: 10, backgroundColor: Colors.secondary_background, marginRight: 8}}/>
                          <Text style={styles.tripTitle}>Từ {request.startLocation}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center'}}>
                          <View style={{height: 10, width: 10, borderRadius: 10, backgroundColor: Colors.blue, marginRight: 8}}/>
                          <Text style={styles.tripTitle}>Đến {request.destination}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={{ flex: 1,flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <TouchableOpacity style = {{flexDirection: 'row', alignItems: 'center'}} >
                        <Text style={styles.driverLink}>SĐT: {request.requester.profile.phone} </Text>
                      </TouchableOpacity>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent:'flex-end' }}>
                        <TouchableOpacity
                          style={styles.createTripButton}
                          onPress={() => handleCancelRequest(request.id)}
                        >
                          <Text style={styles.createTripButtonText}>Hủy</Text>
                        </TouchableOpacity>
                      </View>                   
                    </View>
                  </View>
                )) : <Text style={styles.noDataText}>Bạn chưa duyệt yêu cầu nào.</Text>}
              </View>
            </ScrollView>
            </View>
          </View>
          )}
        </View>
      )}
    </View>
  );
};

export default FixedTrip;
