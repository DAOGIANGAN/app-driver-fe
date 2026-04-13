import { NavigationProp } from "@react-navigation/native";
import React from "react";
import { StatusBar, Text, TouchableOpacity, View } from "react-native";
import { styles } from "./styles";

type Props = {
    navigation: NavigationProp<any>; 
};

const Welcome: React.FC<Props> = ({ navigation }) => {
    return (
            <View style={styles.container}>
                <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
                <View>
                    <Text style={styles.title}>Chào mừng bạn đến với UniDriver!</Text>
                </View>
                <TouchableOpacity style={styles.button1} onPress = {() => navigation.navigate("Register")}>
                    <Text style={styles.buttonText}>Tạo tài khoản</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button2} onPress = {() => navigation.navigate("Login")}>  
                    <Text style={styles.buttonLoginText}>Đăng nhập</Text>
                </TouchableOpacity>
            </View>
    );
}

export default Welcome;