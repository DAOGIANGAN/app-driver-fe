import Colors from '@/src/constants/Color';
import apiClient from '@/src/networking/apiclient';
import ProfileService from '@/src/services/profile.service';
import TokenService from '@/src/services/token.service';
import { Profile, Trip } from '@/src/types/fixedtrip.types';
import { Ionicons } from "@expo/vector-icons";
import { NavigationProp } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, KeyboardAvoidingView, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import io from 'socket.io-client';

interface Message {
  _id: string; // ID của tin nhắn
  senderId: string; // ID của người gửi
  content: string; // Nội dung tin nhắn
  createdAt: string; // Thời gian tạo tin nhắn
}

type Props = {
  navigation: NavigationProp<any>;
};

const MessageScreen: React.FC<Props> = ({ navigation }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [myTrip, setMyTrip] = useState<Trip | null>(null);
  const [myId, setMyId] = useState<number | null>(null);
  const [participants, setParticipants] = useState<Record<string, Profile>>({});


  const sendMessage = async () => {
    if (input.trim() === '') return;

    try {
      const id = await ProfileService.getUserId(); // Lấy userId thay vì id
      if (id == null) {
        console.error('Không thể lấy senderId');
        return;
      }
      const senderId = id.toString(); // Đảm bảo lấy giá trị thực tế của senderId
      setInput('');
      await postMessage(input); // Đảm bảo gửi tin nhắn lên server
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error);
    }
  };

  useEffect(() => {
    // Kết nối tới WebSocket server
    const socket = io(process.env.EXPO_PUBLIC_API_URL ?? '', { transports: ['websocket'] });

    // Lắng nghe sự kiện `newMessage`
    socket.on('newMessage', (message: Message) => {
      console.log('Tin nhắn mới:', message);
      setMessages((prevMessages) => [...prevMessages, message]); // Cập nhật danh sách tin nhắn
    });

    // Lắng nghe sự kiện có người mới tham gia
    socket.on('userApproved', (data: { userId: number }) => {
      console.log('A new user has been approved:', data.userId);
      if (data.userId && !participants[data.userId]) {
        fetchMyTrip(); // Cập nhật lại thông tin chuyến đi để có danh sách members mới nhất
      }
    });

    socket.on('connect', () => {
      console.log('WebSocket đã kết nối:', socket.id);
    });

    // Tham gia phòng (theo tripId)
    if (myTrip && myTrip.id) {
      console.log('Tham gia phòng cho tripId:', myTrip.id);
      const roomName = String(myTrip.id);
      socket.emit('joinRoom', { tripId: roomName});
    }

    // Dọn dẹp kết nối khi component bị unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [myTrip]);

  // Hàm lấy chuyến đi của mình
  const fetchMyTrip = async () => {
    try {
      const accessToken = await TokenService.getAccessToken();
      const userId = await ProfileService.getUserId(); // Lấy userId thay vì id
      console.log("Fetching trip for userId:", userId);
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

  //Hàm gửi tin nhắn lên server
  const postMessage = async (messageContent: string) => {
    try {
      const accessToken = await TokenService.getAccessToken(); // Lấy access token từ dịch vụ
      const userId = await ProfileService.getUserId(); // Lấy userId từ dịch vụ
      const messageData = {
        content: messageContent, // Nội dung tin nhắn
        senderId: userId ? String(userId) : '', // ID người gửi dưới dạng chuỗi
        tripId: myTrip ? myTrip.id : null, // Gửi kèm tripId nếu có
      };
      console.log('Gửi tin nhắn:', messageData);

      // Correct usage of axios.post
      const response = await apiClient.post(
        '/message',
        messageData, // Data to be sent in the request body
        {
          headers: {
            'Content-Type': 'application/json', // Định dạng dữ liệu là JSON
            Authorization: `Bearer ${accessToken}`, // Thêm access token để xác thực
          },
        }
      );

      if (response) {
        console.log('Tin nhắn đã được gửi thành công!');
      } else {
        console.error('Gửi tin nhắn thất bại:', response);
      }
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error);
    }
  };

  //Hàm lấy tin nhắn từ server
  const fetchMessages = async () => {
    try {
      if (!myTrip || !myTrip.id) {
        console.error('Không tìm thấy tripId');
        return;
      }
      const accessToken = await TokenService.getAccessToken();
      const response = await apiClient.get(`/message/trip?tripId=${String(myTrip.id)}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response) {
        const data = await response.data;
        setMessages(data);
      } else {
        console.error('Failed to fetch messages:', response);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  //Gọi hàm fetchMessages khi component được mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const id = await ProfileService.getUserId(); // Lấy userId thay vì id
        console.log("Fetched User ID:", id); // Log để kiểm tra
        setMyId(id);

        if (id) {
          await fetchMyTrip(); // Đợi fetchMyTrip hoàn tất
        } else {
          console.error("User ID is null. Skipping trip and message fetch.");
        }
      } catch (error) {
        console.error("Error in fetchData:", error);
      }
    };

    fetchData();
  },[]);

  useEffect(() => {
    if (myTrip) {
      fetchMessages();
    }
  }, [myTrip]);

  // Lấy thông tin của tất cả người tham gia khi có myTrip
  useEffect(() => {
    if (myTrip) {
      const allUsers = [
        myTrip.driver, 
        ...myTrip.approvedCustomers, 
        ...myTrip.customers
      ];
      
      const newParticipants = allUsers.reduce((acc, user) => {
        if (user && user.id && user.profile) {
          acc[user.id] = user.profile;
        }
        return acc;
      }, {} as Record<string, Profile>);

      setParticipants(newParticipants);
    }
  }, [myTrip]);

  return (
    <View style={styles.Container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <View style={styles.innerContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.6}>
            <Ionicons name="arrow-back" size={26} color="#f5c52a" />
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', marginLeft: 10 }} >
            <Image
              source={(myTrip?.driver.profile.urlPublicAvatar) ? { uri: myTrip.driver.profile.urlPublicAvatar } : require('./../../assets/user1.png')}
              style={styles.driverAvt}
            />
            <View style={{ flexDirection: 'column', justifyContent: 'space-between', borderRadius: 10, marginLeft: 10 }} >
              <View style={{ flexDirection: 'row', alignItems: 'center'}}>
                <Text style={{fontSize: 16, fontWeight: 'bold'}}> {myTrip?.driver.profile.name} </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center'}}>
                <Text style={{fontSize: 14, color: '#666', fontStyle: 'italic', marginHorizontal: 4}}>Tài xế</Text>
              </View>
          </View>
        </View>
        </View>
        <FlatList
          style={{ flex: 1, backgroundColor: '#fcfcfc' }}
          data={messages}
          keyExtractor={item => item._id.toString()}
          renderItem={({ item }) => {
            const isMyMessage = item.senderId === String(myId);
            return (
                <View style={isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer}>
                    {!isMyMessage && (
                        <Image
                            source={(participants[item.senderId]?.urlPublicAvatar) ? { uri: participants[item.senderId].urlPublicAvatar } : require('./../../assets/user1.png')}
                            style={styles.senderAvatar}
                        />
                    )}
                    <View style={{ flex: 1 }}>
                        {!isMyMessage && (
                            <Text style={styles.senderName}>
                                {participants[item.senderId]?.name || 'Unknown User'}
                            </Text>
                        )}
                        <View style={isMyMessage ? styles.myMessage : styles.otherMessage}>
                            <Text style={isMyMessage ? styles.myMessageText : styles.otherMessageText}>
                                {item.content}
                            </Text>
                        </View>
                    </View>
                </View>
            );
        }}
          contentContainerStyle={styles.messageList}
          inverted
        />
        <KeyboardAvoidingView style={{backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: "#f0f0f0", paddingBottom: 10, paddingHorizontal: 10, justifyContent: 'center', alignItems: 'center'}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Nhập tin nhắn..."
              returnKeyType="send"
              onSubmitEditing={sendMessage}
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  Container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
  },
  header: {
    backgroundColor: '#ffffff',
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 10,
    paddingTop: '11%',
    marginBottom: 2,
    paddingHorizontal: 16,

    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4, // Android
  },
  backButton: {
    padding: 8,
    fontSize: 26,
    zIndex: 2,
  },
  driverAvt: {
    width: 40, 
    height: 40, 
    marginRight: 4, 
    borderRadius: 45, 
    backgroundColor: Colors.background_avatar,
    resizeMode: 'contain', 
  },
  senderAvatar: {
    width: 36, 
    height: 36, 
    marginTop: 20,
    borderRadius: 45, 
    backgroundColor: Colors.background_avatar,
    resizeMode: 'contain', 
  },   
  messageList: {
    flexGrow: 1,
    paddingBottom: 12,
    flexDirection: 'column-reverse',
  },
  myMessageContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginVertical: 4,
    paddingHorizontal: 10,
  },
  otherMessageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 4,
    paddingHorizontal: 10,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#1976d2',
    borderRadius: 20,
    marginVertical: 2,
    padding: 10,
    maxWidth: '80%',
    marginRight: 10,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#eeeeee',
    borderRadius: 20,
    marginVertical: 2,
    padding: 10,
    maxWidth: '80%',
    marginLeft: 5,
  },
    myMessageText: {
      color: '#fff',
      fontSize: 16,
    },
    otherMessageText: {
      color: '#000',
      fontSize: 16,
    },
    senderName: {
      color: '#afafaf',
      fontSize: 12,
      fontWeight: 'bold',
      marginLeft: 20,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      backgroundColor: '#fff',
    },
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: Colors.secondary_background,
      borderRadius: 8,
      padding: 8,
      backgroundColor: '#fff',
    },
  });
  export default MessageScreen;