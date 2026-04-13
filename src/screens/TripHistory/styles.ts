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
  tripList: { 
    backgroundColor: Colors.link,
    //marginBottom: 8,
    width: '100%',
  },
  tripCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 10,
    width: '100%',
    alignSelf: 'stretch',
    marginTop: 8,
  },
  tripTitle: { fontSize: 16 },
  tripDesc1: { fontSize: 14, color: '#535353' },
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
  blockButton: {
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
  driverLink: {
    color: '#535353',
    fontSize: 14,
  },
  backButton: {
    padding: 8,
    fontSize: 26,
    zIndex: 2,
  },
});

export default styles;
