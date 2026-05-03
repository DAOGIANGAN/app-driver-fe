import { Ionicons } from "@expo/vector-icons";
import { NavigationProp } from "@react-navigation/native";
import * as Device from "expo-device";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Keyboard,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import apiClient from "../../networking/apiclient";
import TokenService from "../../services/token.service";
import { styles } from "./styles";

type Props = {
  navigation: NavigationProp<any>;
};

const Login: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    console.log("Current errors:", errors);
  }, [errors]);

  const isFormValid = () => {
    return email.trim() !== '' && password.trim() !== '';
  };

  const handleLogin = async () => {
    setErrors({}); // clear errors
    if (!isFormValid()) {
      alert("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    try {
      const deviceInfo = {
        brand: Device.brand,
        model: Device.modelName,
        os: Device.osName,
        osVersion: Device.osVersion,
      };

      const response = await apiClient.post("/auth/login", {
        email,
        password,
        deviceInfo,
      });

      const data = response.data;
      //console.log("Login response:", data);
      TokenService.saveTokens(data.access_token, data.refresh_token);

      //chuẩn
      navigation.reset({
        index: 0,
        routes: [{ name: "Loading" }],
      });

      //test
      // navigation.reset({
      //   index: 0,
      //   routes: [{ name: "Home" }],
      // });
    } catch (error: any) {
      console.log("Login error:", error?.response?.data || error.message);

      if (error.response) {
        const errorMessage = error.response.data.message;

        if (errorMessage === "Unauthorized" || errorMessage === "Invalid credentials") {
          setErrors({
            password: "Tài khoản hoặc mật khẩu không đúng.",
          });
        } else if (errorMessage === "User is not activated") {
          const otp = await apiClient.get("/auth/get-otp-mail-for-register", {
            params: { email },
          });
          if (otp.status === 200) {
            alert("Mã OTP đã được gửi đến email của bạn!");
          }
          navigation.navigate("Activate", { email });
        } else if (error.response.data.errors) {
          const apiErrors: { [key: string]: string } = {};
          for (const key in error.response.data.errors) {
            apiErrors[key] = error.response.data.errors[key][0];
          }
          setErrors(apiErrors);
        }
      } else if (error.request) {
        alert("Không kết nối được đến server, vui lòng kiểm tra mạng!");
      } else {
        alert("Đã xảy ra lỗi, vui lòng thử lại!");
      }
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1 }}>
        <StatusBar translucent backgroundColor="transparent" style="dark" />
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.navigate("Welcome")}
                style={styles.backButton}
                activeOpacity={0.6}
              >
                <Ionicons name="arrow-back" size={26} color="gray" />
              </TouchableOpacity>
              <Text style={styles.title}>Đăng nhập</Text>
            </View>

            <View style={styles.body}>
              <View>
                <Text style={styles.title3}>Lên xe cùng UniDriver!</Text>
                <Text style={styles.title2}>Đăng nhập / Đăng ký tài khoản <Text style={{ fontWeight: 'bold' }}>UniDriver</Text> ngay bây giờ</Text>
              </View>
              {/* <Text style={styles.textInput}>Email</Text> */}
              <TextInput
                style={styles.input}
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}

              {/* <Text style={styles.textInput}>Mật khẩu</Text> */}
              <TextInput
                style={styles.input}
                autoCapitalize="none"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="Password"
              />
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}

              <TouchableOpacity
                style={styles.link1}
                onPress={() => navigation.navigate("ForgotPassword")}
              >
                <Text style={styles.link1}>Quên mật khẩu?</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Tiếp tục</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={styles.link2}>Chưa có tài khoản? Đăng ký</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Login;
