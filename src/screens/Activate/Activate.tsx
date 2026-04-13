import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import React, { useRef, useState } from "react";
import { Keyboard, ScrollView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import Colors from "../../constants/Color";
import apiClient from "../../networking/apiclient";
import styles from "./styles";

type Props = {
    navigation: any;
};

const Activate: React.FC<Props> = ({navigation}) => {  
    const route = useRoute();
    const email = (route.params as { email: string })?.email;
    const [otp, setOtp] = useState(Array(6).fill(""));
    const inputs = useRef<(TextInput | null)[]>([]);

    const handleChange = (text: string, index: number) => {
        if (text.length > 1) return;

        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        if (text && index < 5) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const resendOtp = async () => {
        const response = await apiClient.get("/auth/get-otp-mail-for-register", {params: {email}});
        if (response.status === 200) {
            alert("Mã OTP đã được gửi lại!");
        } else {
            alert("Đã xảy ra lỗi khi gửi mã OTP!");
        }
    }
    const handledSubmit = async () => {
        const codeOtp = otp.join('');
        if (codeOtp.length < 6) {
            alert("Mã OTP không hợp lệ");
            return;
        }
        else {
            const response = await apiClient.post("/auth/verify-otp-mail-for-register", {email: email, OTPCode: codeOtp});
            if (response.status === 201) {
                alert("Xác thực thành công. Vui lòng đăng nhập!");
                navigation.navigate("Login");
            } else {
                console.log("Mã OTP không hợp lệ:", response.data);
                alert("Mã OTP không hợp lệ");
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
                    <StatusBar style="light" />
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.backButton}
                            activeOpacity={0.6}
                        >
                            <Ionicons name="arrow-back" size={26} color={Colors.white_button} />
                        </TouchableOpacity>
                        <Text style={styles.title}>Nhập mã OTP</Text>
                    </View>

                    <View style={styles.body}>
                        <View style={styles.content}>
                            <Text style={styles.text}>Nhập mã OTP được gửi tới email của bạn</Text>
                            <Text style={[styles.text, {fontStyle: "italic"}]}>{email}</Text>
                            <Text style={styles.text}>Mã xác thực có giá trị trong 5 phút</Text>
                        
                            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10 }}>
                                {[...Array(6)].map((_, index) => (
                                    <TextInput
                                    key={index}
                                    ref={(ref) => {
                                        inputs.current[index] = ref;
                                    }}
                                    style={styles.input}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    value={otp[index] || ''}
                                    onChangeText={(text) => handleChange(text, index)}
                                    onKeyPress={(e) => handleKeyPress(e, index)}
                                    />
                                ))}
                            </View>

                            <TouchableOpacity style={styles.link} onPress={() => resendOtp()}>
                                <Text style={styles.link}>Gửi lại mã xác thực</Text>
                                <Ionicons name="reload" size={14} color={Colors.secondary_text} style={{ marginLeft: 5 }} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.button} onPress={() => handledSubmit()}>
                                <Text style={styles.buttonText}>Xác nhận</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                </ScrollView>
            </View>
         </TouchableWithoutFeedback>
    );
}

export default Activate;