import Colors from '@/src/constants/Color';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: "row",
  },
  avatarBox: {
    height: 80, 
    width: 80,
    alignItems: 'center', 
    justifyContent: 'center', 
    borderRadius: 40, 
    borderWidth: 3, 
    borderColor: '#ffffff',
    marginBottom: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 60,
  },
  displayName: {
    color: Colors.primary_background,
    fontSize: 20,
    fontWeight: 'bold',
  },
  displayPhone: {
    color: '#262b3f',
    fontSize: 16,
  },
  displayNameInput: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    padding: 5,
  },
  infoContainer: {
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    paddingTop: 20,
    fontSize: 12,
    color: '#a1a1a1',
    fontWeight: 'bold',
    paddingLeft: 20,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    borderBottomWidth: 1,
    paddingBottom: 5,
    paddingLeft: 20,
    borderColor: '#ccc',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    paddingTop: '11%',
    borderBottomWidth: 1,
    borderBottomColor: '#dbdbdb',
    backgroundColor: '#ffd900',
  },
  profileDetails: {
    backgroundColor: Colors.link,
  },
  button_navigator: {
    backgroundColor: '#fff', 
    flexDirection: 'row', 
    alignItems: 'center', 
    width: '100%', 
    padding: 15,
    marginBottom: 5,
  },
  buttonText: {
    fontSize: 16,
    color: Colors.input_background,
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    flex: 1,
    marginHorizontal: 10,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.secondary_background,
    padding: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  backButton: {
    padding: 8,
    fontSize: 26,
    zIndex: 2,
  },
  logoutButton: {
    backgroundColor: Colors.secondary_background,
    padding: 10,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: Colors.primary_background,
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
    marginRight: 8,
  },
});
