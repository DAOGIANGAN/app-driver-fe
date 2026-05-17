import { Ionicons } from "@expo/vector-icons";
import { NavigationProp } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Keyboard, ScrollView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { navigate } from "../../navigation/NavigationService";
import apiClient from "../../networking/apiclient";
import { styles } from "./styles";

type Props = {
  navigation: NavigationProp<any>;
};

const Register: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const isFormValid = () => {
    return email.trim() !== '' && password.trim() !== '' && confirmPassword.trim() !== '' && name.trim() !== '' && username.trim() !== '' && phone.trim() !== '' && dob.trim() !== '';
  };

  const handleRegister = async () => {
    if (!isFormValid()) {
      alert("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    try {
      const response = await apiClient.post("auth/register", { email, password, confirmPassword, name, username, dob });
      const getOtp = await apiClient.get("/auth/get-otp-mail-for-register", { params: { email } });
      navigate("Activate", { email: email });
    } catch (error: any) {
      if (error.response) {
        console.error("Lỗi từ server:", error.response.data);
        alert(error.response.data.message);
      } else if (error.request) {
        console.error("Không nhận được phản hồi từ server:", error.request);
        alert("Không kết nối được đến server, vui lòng kiểm tra mạng!");
      } else {
        console.error("Lỗi khác:", error.message);
        alert("Đã xảy ra lỗi, vui lòng thử lại!");
      }
    }
  };

  const handleConfirmDate = (date: Date) => {
    const formattedDate = date.toISOString().split("T")[0]; // Định dạng YYYY-MM-DD
    setDob(formattedDate);
    setDatePickerVisibility(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <StatusBar translucent backgroundColor="transparent" style="dark" />
          <View style={styles.container}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.navigate("Welcome")} style={styles.backButton} activeOpacity={0.6}>
                <Ionicons name="arrow-back" size={26} color="gray" />
              </TouchableOpacity>
              <Text style={styles.title}>Đăng ký</Text>
            </View>

            <View style={styles.body}>
              <View>
                <Text style={styles.title3}>Lên xe cùng UniDriver!</Text>
                <Text style={styles.title2}>Đăng nhập / Đăng ký tài khoản <Text style={{ fontWeight: 'bold' }}>UniDriver</Text> ngay bây giờ</Text>
              </View>

              {/* <Text style={styles.textInput}>Email</Text> */}
              <TextInput style={styles.input} autoCapitalize="none" value={email} onChangeText={setEmail} placeholder="Email"/>

              {/* <Text style={styles.textInput}>Họ và tên</Text> */}
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Họ và tên"/>

              {/* <Text style={styles.textInput}>Tên người dùng</Text> */}
              <TextInput style={styles.input} value={username} onChangeText={setUsername} placeholder="Tên người dùng"/>

              {/* <Text style={styles.textInput}>Số điện thoại</Text> */}
              <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Số điện thoại"/>

              {/* <Text style={styles.textInput}>Ngày sinh</Text> */}
              <TouchableOpacity onPress={() => setDatePickerVisibility(true)} style={styles.input}>
                <Text>{dob || "Chọn ngày sinh"}</Text> 
              </TouchableOpacity>

              {/* <Text style={styles.textInput}>Mật khẩu</Text> */}
              <TextInput style={styles.input} autoCapitalize="none" value={password} onChangeText={setPassword} secureTextEntry placeholder="Mật khẩu" />

              {/* <Text style={styles.textInput}>Nhập lại mật khẩu</Text> */}
              <TextInput style={styles.input} autoCapitalize="none" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry placeholder="Nhập lại mật khẩu" />

              <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>Đăng ký</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.link}>Đã có tài khoản? Đăng nhập</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          date={new Date()}
          onConfirm={handleConfirmDate}
          onCancel={() => setDatePickerVisibility(false)}
          themeVariant="light" 
          textColor="black" 
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Register;
