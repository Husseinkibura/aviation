import React from 'react';
import { 
  View, 
  Modal, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  Platform 
} from 'react-native';
import { X, Check } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Animated, { FadeInUp } from 'react-native-reanimated';

type DateTimePickerModalProps = {
  isVisible: boolean;
  mode: 'date' | 'time';
  date: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
};

export default function DateTimePickerModal({
  isVisible,
  mode,
  date,
  onConfirm,
  onCancel
}: DateTimePickerModalProps) {
  const [selectedDate, setSelectedDate] = React.useState(date);

  React.useEffect(() => {
    setSelectedDate(date);
  }, [date]);

  if (Platform.OS === 'ios') {
    return (
      <Modal
        visible={isVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={onCancel}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            entering={FadeInUp.duration(300)}
            style={styles.modalContent}
          >
            <View style={styles.header}>
              <TouchableOpacity onPress={onCancel} style={styles.button}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
              <Text style={styles.title}>
                {mode === 'date' ? 'Select Date' : 'Select Time'}
              </Text>
              <TouchableOpacity 
                onPress={() => onConfirm(selectedDate)} 
                style={styles.button}
              >
                <Check size={24} color="#0A2463" />
              </TouchableOpacity>
            </View>
            
            <DateTimePicker
              value={selectedDate}
              mode={mode}
              display="spinner"
              onChange={(_, date) => date && setSelectedDate(date)}
              style={styles.picker}
            />
          </Animated.View>
        </View>
      </Modal>
    );
  }

  // For Android
  if (isVisible) {
    return (
      <DateTimePicker
        value={selectedDate}
        mode={mode}
        display="default"
        onChange={(_, date) => {
          if (date) {
            onConfirm(date);
          } else {
            onCancel();
          }
        }}
      />
    );
  }
  
  return null;
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#0A2463',
  },
  button: {
    padding: 8,
  },
  picker: {
    height: 200,
    marginTop: 20,
  },
});