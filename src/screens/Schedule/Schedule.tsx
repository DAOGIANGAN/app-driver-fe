import Colors from '@/src/constants/Color';
import apiClient from '@/src/networking/apiclient';
import ProfileService from '@/src/services/profile.service';
import TokenService from '@/src/services/token.service';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { NavigationProp } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import styles from "./styles";

// Kiểu dữ liệu cho một mục trong thời khóa biểu, tương ứng với BE
interface ScheduleItem {
  id: number;
  subjectName: string; // Thêm trường name để hiển thị tên môn học
  dayOfWeek: string; // e.g., 'Thứ Hai', 'Thứ Ba'
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  location: string;
}

// Dữ liệu mẫu mới - Sẽ bị thay thế bằng dữ liệu từ API
const initialSchedule: ScheduleItem[] = [];

const daysOfWeek = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];
const locations = ['GĐ2', 'G2', 'GĐ3', 'GĐ4', 'E3','E5', 'G3'];


type Props = {
  navigation: NavigationProp<any>;
};

const ScheduleScreen: React.FC<Props> = ({ navigation }) => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>(initialSchedule);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentDay, setCurrentDay] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newStartTime, setNewStartTime] = useState(new Date());
  const [newEndTime, setNewEndTime] = useState(new Date());
  const [newLocation, setNewLocation] = useState('');
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const handleStartTimeChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || newStartTime;
    setShowStartTimePicker(Platform.OS === 'ios');
    setNewStartTime(currentDate);
  };

  const handleEndTimeChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || newEndTime;
    setShowEndTimePicker(Platform.OS === 'ios');
    setNewEndTime(currentDate);
  };

  useEffect(() => {
    const loadUserId = async () => {
      const id = await ProfileService.getUserId(); // Lấy userId từ ProfileService
      setUserId(id);
    };
    loadUserId();
  }, []); // Chạy 1 lần duy nhất

  // useEffect thứ hai: Lắng nghe sự thay đổi của `userId`
  // Khi `userId` có giá trị, effect này sẽ được kích hoạt
  useEffect(() => {
    if (userId !== null) {
      fetchSchedules(userId);
    }
  }, [userId]); // Phụ thuộc vào `userId`

  // Hàm lấy TKB từ server
  const fetchSchedules = async (currentUserId: number) => {
    try {
      const accessToken = await TokenService.getAccessToken();
      const response = await apiClient.get(`/schedules/${currentUserId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setSchedule(response.data);
      console.log('Thời khóa biểu đã được tải:', response.data);
    } catch (error) {
      console.error('Lỗi lấy thời khóa biểu:', error);
      Alert.alert('Lỗi', 'Không thể tải được thời khóa biểu.');
    }
  };

  // Hàm mở modal để thêm môn học
  const handleOpenAddModal = (day: string) => {
    setCurrentDay(day);
    setNewSubjectName('');
    setNewStartTime(new Date());
    setNewEndTime(new Date());
    setNewLocation('');
    setModalVisible(true);
  };

  // Hàm lưu môn học mới từ modal (gọi API)
  const handleSaveNewSubject = async () => {
    if (!newSubjectName || !newStartTime || !newEndTime || !newLocation || !userId) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin.');
      return;
    }

    const newSubjectData = {
      subjectName: newSubjectName,
      dayOfWeek: currentDay,
      startTime: formatTime(newStartTime),
      endTime: formatTime(newEndTime),
      location: newLocation,
    };

    try {
      const accessToken = await TokenService.getAccessToken();
      const response = await apiClient.post(`/schedules/${userId}`, newSubjectData, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      // Giả định API trả về object có id, sau đó hợp nhất với dữ liệu đã gửi đi
      const savedSubject = { ...newSubjectData, id: response.data.id };
      setSchedule([...schedule, savedSubject]);
      setModalVisible(false);
    } catch (error) {
      console.error('Lỗi thêm môn học:', error);
      Alert.alert('Lỗi', 'Không thể thêm môn học mới.');
    }
  };

  // Hàm xóa môn học (gọi API)
  const handleDeleteSubject = async (subjectId: number) => {
    try {
      const accessToken = await TokenService.getAccessToken();
      await apiClient.delete(`/schedules/${subjectId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setSchedule(schedule.filter((item) => item.id !== subjectId));
    } catch (error) {
      console.error('Lỗi xóa môn học:', error);
      Alert.alert('Lỗi', 'Không thể xóa môn học.');
    }
  };

  // Hàm lưu thay đổi (gọi API bulk update)
  const handleSaveChanges = async () => {
    if (!userId) return;
    try {
      const accessToken = await TokenService.getAccessToken();
      // Lọc ra những trường cần thiết để gửi đi, tránh gửi thừa dữ liệu
      const schedulesToSave = schedule.map(({ id, ...rest }) => rest);

      await apiClient.post(`/schedules/${userId}/bulk`, schedulesToSave, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      Alert.alert('Lưu thành công', 'Thời khóa biểu đã được cập nhật.');
      if (userId) fetchSchedules(userId); // Tải lại TKB sau khi lưu
    } catch (error) {
      console.error('Lỗi lưu thời khóa biểu:', error);
      Alert.alert('Lỗi', 'Không thể lưu thay đổi.');
    }
  };

  // Nhóm lịch học theo ngày để hiển thị
  const groupedSchedule = daysOfWeek.map(day => ({
    day,
    subjects: schedule.filter(item => item.dayOfWeek === day),
  }));

  return (
    <ScrollView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Thêm môn học cho {currentDay}</Text>
            <TextInput
              placeholder="Tên môn học"
              style={styles.input}
              value={newSubjectName}
              onChangeText={setNewSubjectName}
            />
            
            {/* Start Time Picker */}
            <View style={styles.pickerWrapper}>
              <Text style={styles.label}>Thời gian bắt đầu</Text>
              <TouchableOpacity onPress={() => setShowStartTimePicker(true)} style={styles.timePickerButton}>
                <Text style={styles.timePickerButtonText}>
                  {formatTime(newStartTime)}
                </Text>
              </TouchableOpacity>
              {showStartTimePicker && (
                <DateTimePicker
                  testID="startTimePicker"
                  value={newStartTime}
                  mode="time"
                  is24Hour={true}
                  display="default"
                  onChange={handleStartTimeChange}
                />
              )}
            </View>

            {/* End Time Picker */}
            <View style={styles.pickerWrapper}>
              <Text style={styles.label}>Thời gian kết thúc</Text>
              <TouchableOpacity onPress={() => setShowEndTimePicker(true)} style={styles.timePickerButton}>
                <Text style={styles.timePickerButtonText}>
                  {formatTime(newEndTime)}
                </Text>
              </TouchableOpacity>
              {showEndTimePicker && (
                <DateTimePicker
                  testID="endTimePicker"
                  value={newEndTime}
                  mode="time"
                  is24Hour={true}
                  display="default"
                  onChange={handleEndTimeChange}
                />
              )}
            </View>

            <View style={styles.pickerWrapper}>
              <Text style={styles.label}>Giảng đường</Text>
              <Picker selectedValue={newLocation} onValueChange={setNewLocation} style={styles.picker}>
                <Picker.Item label="Chọn giảng đường" value="" />
                {locations.map(loc => <Picker.Item key={loc} label={loc} value={loc} />)}
              </Picker>
            </View>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveModalButton]}
                onPress={handleSaveNewSubject}
              >
                <Text style={{fontSize: 15, fontWeight: 'bold', color: Colors.primary_background }}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.6}
          >
            <Ionicons name="arrow-back" size={26} color='#006eff' />
          </TouchableOpacity>
        <Text style={styles.headerTitle}>Thời Khóa Biểu</Text>
      </View>      
      {groupedSchedule.map((daySchedule, dayIndex) => {
        return (
        <View key={dayIndex} style={styles.dayContainer}>
          <Text style={styles.dayTitle}>{daySchedule.day}</Text>
          <View style={styles.table}>
            {daySchedule.subjects.length > 0 ? (
              daySchedule.subjects.map((subject) => (
                <View key={subject.id} style={styles.subjectRow}>
                  <View style={styles.subjectInfo}>
                    <Text style={styles.subjectName}>{subject.subjectName}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                      <View style={{height: 10, width: 10, borderRadius: 10, backgroundColor: Colors.secondary_background, marginRight: 5}}/>
                      <Text style={styles.subjectDetails}>
                        Thời gian: {subject.startTime} - {subject.endTime} | Giảng đường: {subject.location}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteSubject(subject.id)}
                  >
                    <Text style={styles.deleteButtonText}>Xóa</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.noSubjectText}>Không có môn học</Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleOpenAddModal(daySchedule.day)}
          >
            <Text style={styles.addButtonText}>+ Thêm môn học</Text>
          </TouchableOpacity>
        </View>
      )})}
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
        <Text style={styles.saveButtonText}>Lưu Thay Đổi</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ScheduleScreen;
