import { StyleSheet } from "react-native";
import Colors from "../../constants/Color";

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingBottom: 40,
    paddingHorizontal: 20,
    backgroundColor: Colors.primary_background,
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
    color: Colors.primary_text,
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
    color: Colors.secondary_text,
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
    backgroundColor: Colors.input_background,
  },
  button: {
    backgroundColor: Colors.yellow_button,
    paddingVertical: 12,
    paddingHorizontal: 25,
    alignItems: "center",
    borderRadius: 30,
    marginVertical: 10,
    marginTop: 20,
  },
  buttonText: {
    color: Colors.tertiary_text,
    fontSize: 18,
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