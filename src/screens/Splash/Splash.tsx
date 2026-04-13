import { NavigationProp } from "@react-navigation/native";
import React, { useEffect } from "react";
import { Image, Text, View } from "react-native";
import apiClient from "../../networking/apiclient";
import TokenService from "../../services/token.service";
import { styles } from "./styles";

type Props = {
    navigation: NavigationProp<any>; 
};

const Splash: React.FC<Props> = ({ navigation }) => {
    useEffect(() => {
        const checkLoginStatus = async () => {
            const refreshToken = await TokenService.getRefreshToken();
            console.log("Refresh token:", refreshToken);
            if (!refreshToken) {
                navigation.reset(
                    {
                        index: 0,
                        routes: [{ name: "Welcome" }],
                    }
                )
                return;
            }
            else {
                try {
                    const response = await apiClient.get("/auth/is-logged-in", {
                        headers: {
                            Authorization: `Bearer ${refreshToken}`
                        }
                    });
                    const data = await response.data;
                    console.log("Trạng thái đăng nhập:", data);
                    if (data.isLoggedIn) {
                        navigation.reset(
                            {
                                index: 0,
                                routes: [{ name: "Loading" }],
                            }
                        )
                    } else {
                        navigation.reset(
                            {
                                index: 0,
                                routes: [{ name: "Welcome" }],
                            }
                        )
                    }
                } catch (error) {
                    //console.error("Lỗi khi kiểm tra trạng thái đăng nhập:", error);
                    navigation.reset(
                        {
                            index: 0,
                            routes: [{ name: "Welcome" }],
                        }
                    )
                }
            }
        }; 
        setTimeout(() => {
            checkLoginStatus();
        }
        , 2000);
    },[navigation]);
    return (
        <View style={styles.container}> 
            <Image
                source={require("./../../assets/logo_onlyf.png")}
                style={styles.logo}
            />
            <Text style={styles.text}>UniDriver</Text>
        </View>
    );
}

export default Splash;
