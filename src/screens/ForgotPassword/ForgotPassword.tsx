import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
    Keyboard,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from "react-native";
import Colors from "../../constants/Color";
import apiClient from "../../networking/apiclient";
import styles from "./styles";

type Props = {
    navigation: any;
};

const ForgotPassword: React.FC<Props> = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const handledSubmit = async () => {
        if (!email) {
            alert("Vui lòng nhập email của bạn!");
            return;
        }
        try {
            const response = await apiClient.get("/auth/get-otp-mail-for-forgot-password", { params: { email } });
            if (response.status === 200) {
                alert("Mã OTP đã được gửi đến email của bạn!");
                navigation.navigate("ConfirmOtp", { email });
            }
        } catch (error: any) {  
              if (error.response) {
                 if (error.response.status === 404) {
                    alert("Email không tồn tại trong hệ thống!");
                 } else {
                    console.error("Lỗi từ server:", error.response.data);
                    alert("Đã xảy ra lỗi, vui lòng thử lại!");
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
                <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ flexGrow: 1 }}
                >
                <View style={styles.container}>
                    <StatusBar translucent backgroundColor="transparent" style="dark" />
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.backButton}
                            activeOpacity={0.6}
                        >
                            <Ionicons name="arrow-back" size={26} color="gray" />
                        </TouchableOpacity>
                        <Text style={styles.title}>Quên mật khẩu</Text>
                    </View>

                    <View style={styles.body}>
                        <View style={styles.content}>
                            <Text style={styles.text}>Nhập email của bạn</Text>
                            <TextInput
                                style={styles.inputEmail}
                                placeholder="Email"
                                placeholderTextColor={Colors.tertiary_text}
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                            />
                            
                            <TouchableOpacity style={styles.button} onPress={() => handledSubmit()}>
                                <Text style={styles.buttonText}>Tiếp tục</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                </ScrollView>
            </View>
         </TouchableWithoutFeedback>
    );
};

export default ForgotPassword;
