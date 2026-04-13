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
    color: Colors.secondary_text,
    alignSelf: "center",
  },
  input: {
    width: "100%",
    fontSize: 16,
    alignSelf: "center",
    color: Colors.primary_background,
    padding: 12,
    marginBottom: '5%',  
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Colors.border_avt2,
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
    title2: {
    fontSize: 14,
    color: Colors.primary_background,
    textAlign: "left",
    marginBottom: 20,
  },
  title3:{
    fontSize:20,
    color: Colors.primary_background,
    textAlign: "left",
    marginBottom: 20,
    fontWeight: '700',
  },
});

export default styles;