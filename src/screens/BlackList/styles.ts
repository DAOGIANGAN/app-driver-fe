import Colors from '@/src/constants/Color';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffd900',
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    paddingTop: '11%',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: -26,
    color: Colors.primary_background,
  },
  backButton: {
    padding: 8,
    fontSize: 26,
    zIndex: 2,
  },
  blockList: { 
    backgroundColor: Colors.link,
    //marginBottom: 8,
    width: '100%',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginTop: 8,
    padding: 16,
  },
  driverAvt: {
    width: 45, 
    height: 45, 
    marginRight: 4, 
    borderRadius: 10, 
    backgroundColor: Colors.background_avatar,
    resizeMode: 'contain', 
  },
  userInfo: {
    flex: 1,
    marginLeft: 8,
    marginBottom: 5,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  phone: {
    fontSize: 14,
    color: '#0099ff',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: Colors.secondary_background,
    padding: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.primary_background,
    fontWeight: 'bold',
  },
});

export default styles;