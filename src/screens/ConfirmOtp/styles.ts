import { StyleSheet } from "react-native";
import Colors from "../../constants/Color";

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingBottom: 40,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    paddingTop: '11%',
  },
  backButton: {
    padding: 8,
    fontSize: 26,
    zIndex: 2,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: -26,
    color: Colors.primary_background,
  },
  body: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginTop: "20%",
  },
  content: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 20,
  },
  text: {
    fontSize: 16, 
    marginBottom: 10,
    color: Colors.primary_background,
  },
  text1: {
    fontSize: 12,
    marginBottom: 10,
    color: Colors.primary_background,
  },
  input: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 22,
    marginHorizontal: 2,
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: Colors.secondary_text,
  },
  button: {
    backgroundColor: Colors.secondary_background,
    width: "100%",
    height: 40,
    alignItems: "center",
    alignSelf: "center",
    justifyContent: "center",
    borderRadius: 5,
    marginBottom:10,
    marginTop: 10,
  },
  buttonText: {
    color: Colors.primary_background,
    fontSize: 16,
    fontWeight: "bold",
  },
  link: {
    color: Colors.link,
    fontSize: 14,
    margin: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    alignSelf: "flex-start",
    marginTop: -3,
    marginBottom: 5,
  },
});

export default styles;