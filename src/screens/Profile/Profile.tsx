import Colors from '@/src/constants/Color';
import { Ionicons } from "@expo/vector-icons";
import { NavigationProp, RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import apiClient from '../../networking/apiclient';
import ProfileService from '../../services/profile.service';
import TokenService from '../../services/token.service';
import { styles } from './styles';

// Đồng bộ với Profile entity bên backend
type Profile = {
  id: number;
  name: string; // Tên hiển thị
  email: string;
  urlPublicAvatar?: string; // Đường dẫn ảnh public
  pathAvatar?: string;      // Đường dẫn ảnh local
  phone?: string;
  dob: string;              // Ngày sinh
  username: string;
  userId: number | null;
  isActivated: boolean | null;
};

// Định nghĩa props cho màn hình
type ProfileScreenRouteProp = RouteProp<{ Profile: { userId: number } }, 'Profile'>;

type Props = {
  route: ProfileScreenRouteProp;
  navigation: NavigationProp<any>;
};

const ProfileScreen: React.FC<Props> = ({ route, navigation }) => {
  const { userId } = route.params;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [editableProfile, setEditableProfile] = useState<Partial<Profile>>({});
  const [myId, setMyId] = useState<number | null>(null);
  const [isMe, setIsMe] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const handleImageUpload = async () => {
    // Request permission
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Quyền truy cập", "Bạn cần cấp quyền truy cập thư viện ảnh để tải ảnh lên.");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true, // Yêu cầu base64 để gửi lên Cloudinary
    });

    if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
      setIsLoading(true);
      try {
        const asset = pickerResult.assets[0];
        const base64Img = `data:image/jpg;base64,${asset.base64}`;
        
        const formData = new FormData();
        formData.append('file', base64Img);
        formData.append('upload_preset', 'avatar_appdriver'); 

        const cloudinaryUploadUrl = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_URL;
        if (!cloudinaryUploadUrl) {
          throw new Error('Missing Cloudinary upload URL');
        }

        const response = await fetch(cloudinaryUploadUrl, { 
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (data.secure_url) {
          const downloadURL = data.secure_url;
          // Update profile with new photo URL
          setEditableProfile(prev => ({ ...prev, urlPublicAvatar: downloadURL }));
          
          // Automatically save the change
          await handleSaveChanges(downloadURL);
        } else {
          throw new Error('Cloudinary upload failed');
        }

      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        Alert.alert("Lỗi", "Không thể tải ảnh lên. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleConfirmDate = (date: Date) => {
    const formattedDate = date.toISOString().split("T")[0]; // Định dạng YYYY-MM-DD
    handleInputChange('dob', formattedDate);
    setDatePickerVisibility(false);
  };

  {/* Hàm xử lý đăng xuất*/}
  const handleLogout = async () => {
    const refreshToken = await TokenService.getRefreshToken();
    if (!refreshToken) {
      navigation.reset(
        {
          index: 0,
          routes: [{ name: 'Welcome' }],
        }
      );
      return;
    }
    try {
      await ProfileService.removeProfile();
      console.log("Thông tin người dùng đã được xóa khỏi thiết bị.");
    } catch (error) {
      console.error("Lỗi khi xóa thông tin người dùng:", error);
    }

    //FCM.deleteTokenFromSecureStore();
    TokenService.removeTokens();
    
    navigation.reset(
      {
        index: 0,
        routes: [{ name: 'Welcome' }],
      }
    );
    //alert("Đăng xuất thành công!");
  }

  // Lấy thông tin profile
  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const currentUserId = await ProfileService.getUserId();
      setMyId(currentUserId);
      setIsMe(currentUserId === userId);

      const accessToken = await TokenService.getAccessToken();
      const response = await apiClient.get<Profile>(`/profiles/${userId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setProfile(response.data);
      setEditableProfile(response.data); // Khởi tạo dữ liệu cho form sửa
    } catch (err) {
      setError('Không thể tải thông tin người dùng. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Xử lý khi lưu thay đổi
  const handleSaveChanges = async (newPhotoUrl?: string) => {
    setIsLoading(true);
    try {
        const accessToken = await TokenService.getAccessToken();
        const profileToSave = { ...editableProfile };
        if (newPhotoUrl) {
            profileToSave.urlPublicAvatar = newPhotoUrl;
        }

        await apiClient.post('/profiles', profileToSave, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        await fetchProfile(); // Tải lại thông tin mới nhất
        setIsEditing(false); // Thoát chế độ chỉnh sửa
        Alert.alert('Thành công', 'Thông tin cá nhân đã được cập nhật.');
    } catch (err) {
        Alert.alert('Lỗi', 'Không thể lưu thay đổi. Vui lòng thử lại.');
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  };

  // Xử lý khi hủy chỉnh sửa
  const handleCancelEdit = () => {
    setEditableProfile(profile || {}); // Reset lại form
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof Profile, value: string) => {
    setEditableProfile(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
  }

  if (error) {
    return <View style={styles.centered}><Text>{error}</Text></View>;
  }

  if (!profile) {
    return <View style={styles.centered}><Text>Không tìm thấy thông tin người dùng.</Text></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <View style={styles.profileHeader}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.6}>
            <Ionicons name="arrow-back" size={26} color="gray" />
          </TouchableOpacity>
          <View style={{flex: 1, alignItems: 'center', marginLeft: -46}}>
            <TouchableOpacity style={styles.avatarBox} onPress={isMe && isEditing ? handleImageUpload : undefined} disabled={!isMe || !isEditing}>
                <Image
                source={editableProfile.urlPublicAvatar ? { uri: editableProfile.urlPublicAvatar }: require('./../../assets/user1.png') }
                style={styles.avatar}
                />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.displayName}>{profile.name}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
          <Image source={require('./../../assets/flag.png')} style={{ width: 16, height: 16, marginRight: 6 }} />
          <View style={{ width: 3, height: 3, backgroundColor: Colors.primary_background, marginRight: 4, marginBottom: 5, borderRadius: 5 }} />
          <Text style={styles.displayPhone}>{profile.phone}</Text>
        </View>
      </View>

      <View style={styles.profileDetails}>
        {isEditing ? (
          <View>
            <Text style={styles.label}>TÊN HIỂN THỊ</Text>
            <TextInput
              style={styles.input}
              value={editableProfile.name || ''}
              onChangeText={(value) => handleInputChange('name', value)}
            />
            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              style={styles.input}
              value={editableProfile.email || ''}
              onChangeText={(value) => handleInputChange('email', value)}
              keyboardType="email-address"
            />
            <Text style={styles.label}>SỐ ĐIỆN THOẠI</Text>
            <TextInput
              style={styles.input}
              value={editableProfile.phone || ''}
              onChangeText={(value) => handleInputChange('phone', value)}
              keyboardType="phone-pad"
            />
            <Text style={styles.label}>NGÀY SINH</Text>
            <TouchableOpacity onPress={() => setDatePickerVisibility(true)} style={styles.input}>
                <Text style={{paddingTop: 10}}>{editableProfile.dob || "Chọn ngày sinh"}</Text> 
            </TouchableOpacity>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={() => handleSaveChanges()} activeOpacity={0.8}>
                <Text style={{color: Colors.primary_background, fontSize: 16, fontWeight: 'bold'}}>Lưu thay đổi</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, { backgroundColor: '#dddddd' }]} onPress={handleCancelEdit} activeOpacity={0.8}>
                <Text style={{color: Colors.primary_background, fontSize: 16, fontWeight: 'bold'}}>Hủy</Text>
              </TouchableOpacity>
              {/* <Button title="Lưu thay đổi" onPress={() => handleSaveChanges()} />
              <Button title="Hủy" onPress={handleCancelEdit} color="red" /> */}
            </View>
          </View>
        ) : (
          <View>
            <TouchableOpacity style={styles.button_navigator} onPress={() => navigation.navigate('TripHistory')}>
              <Image source={require('./../../assets/clock_gray.png')} style={{ width: 20, height: 20, marginRight: 10 }} />
              <Text style={styles.buttonText}>Lịch sử chuyến đi</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button_navigator} onPress={() => navigation.navigate('BlackList')}>
              <Image source={require('./../../assets/delete_user.png')} style={{ width: 20, height: 20, marginRight: 10 }} />
              <Text style={styles.buttonText}>Danh sách người dùng bị chặn</Text>
            </TouchableOpacity>
            {isMe && (
              <TouchableOpacity style={styles.button_navigator} onPress={() => setIsEditing(true)}>
                <Image source={require('./../../assets/pen.png')} style={{ width: 20, height: 20, marginRight: 10 }} />
                <Text style={styles.buttonText}>Chỉnh sửa thông tin cá nhân</Text>
              </TouchableOpacity>
            )}
            {isMe && (
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Đăng xuất</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        date={new Date()}
        onConfirm={handleConfirmDate}
        onCancel={() => setDatePickerVisibility(false)}
        themeVariant="light" 
        textColor="black" 
        />
    </ScrollView>
  );
};

export default ProfileScreen;
