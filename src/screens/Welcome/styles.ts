import { StyleSheet } from "react-native";
import Colors from "../../constants/Color";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primary_text,
    },
    image: {
        width: 200,
        height: 200,
        marginBottom: 10
    },
    title: {
        fontSize: 23,
        marginBottom: 20,
        color: Colors.primary_background,
        fontWeight: 'bold',
    },
    button1: {
        height: 50,
        margin: 10,
        backgroundColor: "#f5c52a",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 5,
        width: '90%',
    },
    buttonText: {
        fontSize: 18,
        color: Colors.primary_background,
        fontWeight: 'bold',
    },
    button2: {
        height: 50,
        margin: 10,
        backgroundColor: Colors.myMessage,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 5,
        width: '90%',
    },
    buttonLoginText: {
        fontSize: 18,
        color: Colors.primary_background,
        fontWeight: 'bold',
    },
    background: {
        flex: 1,
        resizeMode: 'cover', // hoặc 'stretch'
    },
});