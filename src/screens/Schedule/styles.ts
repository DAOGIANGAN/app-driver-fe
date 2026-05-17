import Colors from '@/src/constants/Color';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#a8d8ff',
    padding: 10,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: -26,
    color: Colors.primary_background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingTop: '8%',
  },
  backButton: {
    padding: 8,
    fontSize: 26,
    zIndex: 2,
  },
  dayContainer: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dayTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary_background,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.secondary_background,
    paddingBottom: 5,
  },
  table: {
    // Bảng chứa các môn học
  },
  subjectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.secondary_background,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
  },
  subjectDetails: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    backgroundColor: Colors.secondary_background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  deleteButtonText: {
    color: Colors.primary_background,
    fontWeight: 'bold',
  },
  noSubjectText: {
    textAlign: 'center',
    color: '#999',
    marginVertical: 15,
    fontStyle: 'italic',
  },
  addButton: {
    backgroundColor: Colors.secondary_background,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: Colors.primary_background,
    fontWeight: 'bold',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: Colors.secondary_background,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
    elevation: 3,
    marginBottom: 30,
  },
  saveButtonText: {
    color: Colors.primary_background,
    fontWeight: 'bold',
    fontSize: 15,
  },
  // Styles for Modal
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#aaa',
  },
  saveModalButton: {
    backgroundColor: Colors.secondary_background,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    marginLeft: 4,
    color: Colors.primary_background,
  },
  timePickerButtonText: {
    fontSize: 16,
  },
  timePickerButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  pickerWrapper: {
    marginBottom: 12,
    width: '100%',
  },
  picker: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
});

export default styles;