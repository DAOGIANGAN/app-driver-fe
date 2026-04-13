import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import React, { useState } from "react";
import {
    Keyboard,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from "react-native";
import apiClient from "../../networking/apiclient";
import styles from "./styles";

type Props = {
    navigation: any;
};

const ResetPassword: React.FC<Props> = ({ navigation }) => {
    const route = useRoute();
    const accessToken = (route.params as { accessToken: string })?.accessToken;
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const isFormValid = () => {
        return password.trim() !== '' && confirmPassword.trim() !== '' && password === confirmPassword;
    };

    const handleSubmit = async () => {
        if (!isFormValid()) {
            alert("Vui lòng điền đầy đủ thông tin và đảm bảo mật khẩu trùng khớp.");
            return;
        }
        try {
            const response = await apiClient.post("/user/reset-password", {
                password: password,
                confirmPassword: confirmPassword,
            }, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                }
            });
            console.log(response.data);
            if (response.status === 201) {
                alert("Đặt lại mật khẩu thành công!");
                navigation.navigate("Login");
            } else {
                console.error("Lỗi từ server:", response.data);
                alert("Đã xảy ra lỗi 1");
            }
        }
        catch (error: any) {
            if (error.response) {
                console.error("Lỗi từ server:", error.response.data);
                alert("Đã xảy ra lỗi 2, vui lòng thử lại!");
            } else if (error.request) {
                alert("Không kết nối được đến server, vui lòng kiểm tra mạng!");
            } else {
                alert("Đã xảy ra lỗi 3, vui lòng thử lại!");
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
                <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
                <View style={styles.container}>
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.backButton}
                            activeOpacity={0.6}
                        >
                            <Ionicons name="arrow-back" size={26} color="gray" />
                        </TouchableOpacity>
                        <Text style={styles.title}>Đặt lại mật khẩu</Text>
                    </View>

                    <View style={styles.body}>
                        <View style= {{width: "100%"}}>
                            <Text style={styles.title3}>Vui lòng điền đầy đủ thông tin!</Text>
                            <Text style={styles.title2}>Đặt lại mật khẩu tài khoản <Text style={{ fontWeight: 'bold' }}>UniDriver</Text> </Text>
                        </View>
                        <View style={styles.content}>
                            <TextInput
                                style={styles.input}
                                autoCapitalize="none"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                placeholder="Nhập mật khẩu mới"
                            />
                            <TextInput
                                style={styles.input}
                                autoCapitalize="none"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                                placeholder="Nhập lại mật khẩu mới"
                            />
                            
                            <TouchableOpacity style={styles.button} onPress={() => handleSubmit()}>
                                <Text style={styles.buttonText}>Lưu thay đổi</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                </ScrollView>
            </View>
         </TouchableWithoutFeedback>
    );
};

export default ResetPassword;
