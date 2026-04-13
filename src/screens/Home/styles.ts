import Colors from '@/src/constants/Color';
import { StatusBar, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    // backgroundColor: '#f7f7f7', 
    padding: 16 
  },
  profileContainer: {
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 16 , 
    marginTop: StatusBar.currentHeight || 0,
  },
  username: { 
    fontSize: 14, 
    fontWeight: 'bold',
    color: Colors.primary_background, 
  },
  filterContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    // Thêm bóng đổ
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4, // Android
  },
  // Thêm style mới cho hàng ngang
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Dàn đều các phần tử
    gap: 8, // Khoảng cách giữa các picker
  },
  filterIcons:{
    width: 16, 
    height: 16, 
    marginLeft: 6,
    marginRight: 3,
  },
  pickerWrapper: {
    flex: 1, // Cho phép picker chiếm đều không gian
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
    marginLeft: 4,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0', // Chuyển nền trắng vào đây
    borderRadius: 10,       // và bo góc ở đây
    height: 40,            // Tăng chiều cao một chút
  },
  picker: {
    flex: 1,
    // height: 36,
    // backgroundColor: '#fff',
    // borderRadius: 8,
  },
  searchButton: {
    backgroundColor: Colors.secondary_background,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    // marginTop: 18,
    height: 40,
  },
  searchButtonText: { color: Colors.primary_background, fontWeight: 'bold', fontSize: 15 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginVertical: 8 },
  tripList: { 
    marginBottom: 8,
    width: '100%',
  },
  tripCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 10,
    width: '100%',
    alignSelf: 'stretch',

    borderRadius: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4, // Android
  },
  tripTitle: { fontSize: 16 },
  tripDesc1: { fontSize: 13, color: Colors.blue },
  tripDesc2: { fontSize: 16, color: Colors.primary_background, marginTop: 2 , fontWeight: 'bold'},
  myTripCard: {
    backgroundColor: '#fffde7',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ffe082',
    alignSelf: 'stretch',
  },
  driverAvt: {
    width: 45, 
    height: 45, 
    marginRight: 4, 
    borderRadius: 10, 
    backgroundColor: Colors.background_avatar,
    resizeMode: 'contain', 
  },
  driverLink: {
    color: '#535353',
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    height: 70,
    padding: 10,
    borderTopWidth: 2,
    borderColor: '#f8f5da',
  },
  createTripButton: {
    backgroundColor: Colors.secondary_background,
    padding: 5,
    borderRadius: 10,
    alignItems: 'center',
  },
  createTripButtonText: {
    color: Colors.primary_background,
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
    marginRight: 8,
  },
  timePickerButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    width: '100%',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  timePickerButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.primary_background,
  },
  chatButton: {
    padding: 10,
    borderRadius: 5,
    flexDirection: 'column',
    justifyContent: 'center',    
    alignItems: 'center',
    width: 80,
  },
  chatButtonText: { color: Colors.primary_background, fontWeight: 'bold', fontSize: 12 },
  selectedValue: {
    marginLeft: 8,
    color: Colors.primary_background,
    fontWeight: 'bold',
    fontSize: 13,
  },
  cancelButton: {
  backgroundColor: '#d32f2f',
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: 20,
  alignItems: 'center',
  marginTop: 10,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default styles;