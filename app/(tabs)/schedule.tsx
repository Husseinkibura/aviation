// app/(tabs)/schedule.tsx

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList,
  SafeAreaView,
  Platform,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
  TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Calendar, Clock, Plane, PlaneTakeoff, PlaneLanding as PlaneLoanding, X, Check, Bell, CalendarDays } from 'lucide-react-native';
import { useUserData } from '@/contexts/UserDataContext';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import DateTimePickerModal from '@/components/DateTimePickerModal';
import { format } from 'date-fns';
import { useToast } from '@/contexts/ToastContext';

// In ScheduleScreen component
const convertTo24Hour = (date: Date | null) => {
  if (!date || isNaN(date.getTime())) return null;
  return format(date, 'HH:mm:ss');
};

const formatDateForBackend = (date: Date | null) => {
  if (!date) return '';
  return format(date, 'yyyy-MM-dd');
};

const calculateTotalHours = (departure: Date | null, arrival: Date | null) => {
  if (!departure || !arrival) return 0;
  const durationMs = arrival.getTime() - departure.getTime();
  return durationMs / (1000 * 60 * 60);
};

export default function ScheduleScreen() {
  const router = useRouter();
  const { upcomingFlights, scheduleNewFlight } = useUserData();
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [visibleMonth, setVisibleMonth] = useState(new Date());
  
  const [date, setDate] = useState<Date | null>(new Date());
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [aircraft, setAircraft] = useState('');
  const [departureTime, setDepartureTime] = useState<Date | null>(new Date());
  const [isDepartureTimePickerVisible, setDepartureTimePickerVisible] = useState(false);
  const [arrivalTime, setArrivalTime] = useState<Date | null>(new Date(Date.now() + 3600000));
  const [isArrivalTimePickerVisible, setArrivalTimePickerVisible] = useState(false);
  const [notificationTime, setNotificationTime] = useState('1 hour before');
  const [isNotificationPickerVisible, setNotificationPickerVisible] = useState(false);
  const [flightType, setFlightType] = useState('');
  const { showToast } = useToast();

  const handleScheduleFlight = async () => {
    if (!departure || !arrival || !aircraft || !date) {
      showToast('Please fill all required fields', 'error');
      // Alert.alert('Missing Information', 'Please fill all required fields');
      return;
    }
  
    // Convert times to 24-hour format
    const depTime = convertTo24Hour(departureTime);
    const arrTime = convertTo24Hour(arrivalTime);
  
    if (!depTime || !arrTime) {
      Alert.alert('Invalid Time', 'Please select valid departure and arrival times');
      return;
    }

    try {
      const totalHours = calculateTotalHours(departureTime, arrivalTime);
      
      if (isNaN(totalHours)) {
        Alert.alert('Invalid Time', 'Please select valid departure and arrival times');
        return;
      }

      if (totalHours <= 0) {
        Alert.alert('Invalid Duration', 'Arrival time must be after departure time');
        return;
      }

      const newFlight = {
        id: String(Date.now()),
        date: formatDateForBackend(date),
        departure,
        arrival,
        aircraft,
        status: 'Confirmed',
        type: flightType.toLowerCase(),
        notification: notificationTime,
        departure_time: depTime,
        arrival_time: arrTime,
        total_hours: Number(totalHours.toFixed(1))
      };

      await scheduleNewFlight(newFlight);
      showToast(`Flight from ${departure} to ${arrival} scheduled!`, 'success');
      resetForm();
      setIsModalVisible(false);

      Alert.alert(
        "Flight Scheduled",
        `Your flight from ${departure} to ${arrival} has been scheduled for ${format(date, 'MMM d, yyy')}.`,
        [{ text: "OK" }]
      );
    } catch (error) {
      showToast('Failed to schedule flight', 'error');
      Alert.alert('Error', 'Failed to schedule flight. Please try again.');
    }
  };

   // Update date/time picker handlers
   const handleDateConfirm = (selectedDate: Date) => {
    setDatePickerVisible(false);
    setDate(selectedDate);
  };

  const handleDepartureTimeConfirm = (selectedTime: Date) => {
    setDepartureTimePickerVisible(false);
    setDepartureTime(selectedTime);
    
    if (arrivalTime && selectedTime > arrivalTime) {
      const newArrivalTime = new Date(selectedTime.getTime() + 3600000);
      setArrivalTime(newArrivalTime);
    }
  };

  const handleArrivalTimeConfirm = (selectedTime: Date) => {
    if (departureTime && selectedTime > departureTime) {
      setArrivalTimePickerVisible(false);
      setArrivalTime(selectedTime);
    } else {
      Alert.alert('Invalid Time', 'Arrival time must be after departure time');
    }
  };
  
  // Calendar helper functions
  const daysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const firstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };
  
  const generateCalendarDays = () => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    
    const days = [];
    const totalDays = daysInMonth(month, year);
    const firstDay = firstDayOfMonth(month, year);
    
    // Add empty slots for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: '', empty: true });
    }
    
    // Add days of the month
    for (let i = 1; i <= totalDays; i++) {
      const currentDate = new Date(year, month, i);
      
      // Check if there are flights on this day
      const hasFlights = upcomingFlights.some(flight => {
        const flightDate = new Date(flight.date);
        return flightDate.getDate() === i && 
               flightDate.getMonth() === month && 
               flightDate.getFullYear() === year;
      });
      
      days.push({ 
        day: i, 
        date: currentDate,
        hasFlights,
        isToday: 
          currentDate.getDate() === new Date().getDate() && 
          currentDate.getMonth() === new Date().getMonth() && 
          currentDate.getFullYear() === new Date().getFullYear(),
        isSelected: 
          currentDate.getDate() === selectedDate.getDate() && 
          currentDate.getMonth() === selectedDate.getMonth() && 
          currentDate.getFullYear() === selectedDate.getFullYear()
      });
    }
    
    return days;
  };
  
  const previousMonth = () => {
    const newMonth = new Date(visibleMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setVisibleMonth(newMonth);
  };
  
  const nextMonth = () => {
    const newMonth = new Date(visibleMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setVisibleMonth(newMonth);
  };
  
  const selectDay = (date) => {
    setSelectedDate(date);
  };
  
  // Filter flights for selected date
  const filteredFlights = upcomingFlights.filter(flight => {
    const flightDate = new Date(flight.date);
    return flightDate.getDate() === selectedDate.getDate() && 
           flightDate.getMonth() === selectedDate.getMonth() && 
           flightDate.getFullYear() === selectedDate.getFullYear();
  });

  
  const resetForm = () => {
    setDate(new Date());
    setDeparture('');
    setArrival('');
    setAircraft('');
    setDepartureTime(new Date());
    setArrivalTime(new Date(Date.now() + 3600000));
    setNotificationTime('1 hour before');
    setFlightType('');
  };

  const renderFlightItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.flightCard}
      onPress={() => router.push(`/flight/${item.id}`)}
    >
      <View style={styles.flightHeader}>
        <View style={styles.flightTime}>
          <Text style={styles.flightTimeText}>{item.departureTime} - {item.arrivalTime}</Text>
        </View>
        <View style={[
          styles.flightStatus, 
          { backgroundColor: item.status === 'Confirmed' ? '#3E92CC' : '#FFC107' }
        ]}>
          <Text style={styles.flightStatusText}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.flightRoute}>
        <View style={styles.airport}>
          <PlaneTakeoff size={16} color="#0A2463" />
          <Text style={styles.airportCode}>{item.departure}</Text>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.airport}>
          <PlaneLoanding size={16} color="#0A2463" />
          <Text style={styles.airportCode}>{item.arrival}</Text>
        </View>
      </View>
      
      <View style={styles.flightDetails}>
        <Text style={styles.flightAircraft}>{item.aircraft}</Text>
        <Text style={styles.flightDuration}>{item.duration}</Text>
      </View>
      
      {item.notification && (
        <View style={styles.notificationTag}>
          <Bell size={12} color="#475569" style={{ marginRight: 4 }} />
          <Text style={styles.notificationText}>{item.notification}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderDay = ({ item }) => {
    if (item.empty) {
      return <View style={styles.emptyDay} />;
    }
    
    return (
      <TouchableOpacity
        style={[
          styles.day,
          item.isToday && styles.today,
          item.isSelected && styles.selectedDay
        ]}
        onPress={() => selectDay(item.date)}
      >
        <Text 
          style={[
            styles.dayText,
            item.isToday && styles.todayText,
            item.isSelected && styles.selectedDayText
          ]}
        >
          {item.day}
        </Text>
        {item.hasFlights && <View style={styles.flightIndicator} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Flight Schedule</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setIsModalVisible(true)}
          >
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.calendarContainer}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={previousMonth}>
              <Text style={styles.calendarNavButton}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.calendarTitle}>
              {visibleMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
            <TouchableOpacity onPress={nextMonth}>
              <Text style={styles.calendarNavButton}>›</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.weekdays}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <Text key={day} style={styles.weekday}>{day}</Text>
            ))}
          </View>
          
          <FlatList
            data={generateCalendarDays()}
            renderItem={renderDay}
            keyExtractor={(item, index) => index.toString()}
            numColumns={7}
            scrollEnabled={false}
          />
        </View>
        
        <View style={styles.scheduleSection}>
          <View style={styles.sectionHeader}>
            <CalendarDays size={20} color="#0A2463" />
            <Text style={styles.sectionTitle}>
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </View>
          
          {filteredFlights.length > 0 ? (
            <FlatList
              data={filteredFlights}
              renderItem={renderFlightItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.flightList}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <CalendarDays size={40} color="#CBD5E1" />
              <Text style={styles.emptyStateText}>No flights scheduled</Text>
              <TouchableOpacity 
                style={styles.scheduleButton}
                onPress={() => setIsModalVisible(true)}
              >
                <Text style={styles.scheduleButtonText}>Schedule a Flight</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
      
      {/* Schedule Flight Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <Animated.View 
            entering={FadeInUp.duration(300)}
            style={styles.modalContainer}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Schedule New Flight</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setIsModalVisible(false)}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Date</Text>
                <TouchableOpacity 
                  style={styles.formInput}
                  onPress={() => setDatePickerVisible(true)}
                >
                  <Calendar size={20} color="#6B7280" style={styles.inputIcon} />
                  {/* <Text style={styles.inputText}>
                    {date.toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </Text> */}
                  <Text style={styles.inputText}>
  {format(date, 'MMM d, yyy')}
</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.formLabel}>Departure Airport</Text>
                  <View style={styles.formInput}>
                    <PlaneTakeoff size={20} color="#6B7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="ICAO Code"
                      value={departure}
                      onChangeText={setDeparture}
                      autoCapitalize="characters"
                      maxLength={4}
                    />
                  </View>
                </View>
                
                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.formLabel}>Arrival Airport</Text>
                  <View style={styles.formInput}>
                    <PlaneLoanding size={20} color="#6B7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="ICAO Code"
                      value={arrival}
                      onChangeText={setArrival}
                      autoCapitalize="characters"
                      maxLength={4}
                    />
                  </View>
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Aircraft</Text>
                <View style={styles.formInput}>
                  <Plane size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Aircraft Type/Registration"
                    value={aircraft}
                    onChangeText={setAircraft}
                  />
                </View>
              </View>
              
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.formLabel}>Departure Time</Text>
                  <TouchableOpacity 
                    style={styles.formInput}
                    onPress={() => setDepartureTimePickerVisible(true)}
                  >
                    <Clock size={20} color="#6B7280" style={styles.inputIcon} />
                    <Text style={styles.inputText}>
  {format(departureTime, 'HH:mm')}
</Text>

                  </TouchableOpacity>
                </View>
                
                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.formLabel}>Arrival Time</Text>
                  <TouchableOpacity 
                    style={styles.formInput}
                    onPress={() => setArrivalTimePickerVisible(true)}
                  >
                    <Clock size={20} color="#6B7280" style={styles.inputIcon} />
                    <Text style={styles.inputText}>
  {format(arrivalTime, 'HH:mm')}
</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Notification</Text>
                <TouchableOpacity 
                  style={styles.formInput}
                  onPress={() => setNotificationPickerVisible(true)}
                >
                  <Bell size={20} color="#6B7280" style={styles.inputIcon} />
                  <Text style={styles.inputText}>{notificationTime}</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Flight Type</Text>
                <View style={styles.typeOptions}>
                  {['Training', 'Commercial', 'Cross-Country', 'Instrument'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeOption,
                        flightType === type && styles.typeOptionSelected
                      ]}
                      onPress={() => setFlightType(type)}
                    >
                      <Text 
                        style={[
                          styles.typeOptionText,
                          flightType === type && styles.typeOptionTextSelected
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
    style={styles.saveButton}
    onPress={() => {
      handleScheduleFlight();
      showToast('Scheduling your flight...', 'success');
    }}
  >
                <Check size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.saveButtonText}>Schedule Flight</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
      
      {/* Date Picker Modal */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        date={date}
        onConfirm={(selectedDate) => {
          setDatePickerVisible(false);
          setDate(selectedDate);
        }}
        onCancel={() => setDatePickerVisible(false)}
      />
      
      {/* Departure Time Picker Modal */}
      <DateTimePickerModal
        isVisible={isDepartureTimePickerVisible}
        mode="time"
        date={departureTime}
        onConfirm={(selectedTime) => {
          setDepartureTimePickerVisible(false);
          setDepartureTime(selectedTime);
          
          // Ensure arrival time is after departure time
          if (selectedTime > arrivalTime) {
            const newArrivalTime = new Date(selectedTime.getTime() + 3600000); // +1 hour
            setArrivalTime(newArrivalTime);
          }
        }}
        onCancel={() => setDepartureTimePickerVisible(false)}
      />
      
      {/* Arrival Time Picker Modal */}
      <DateTimePickerModal
        isVisible={isArrivalTimePickerVisible}
        mode="time"
        date={arrivalTime}
        onConfirm={(selectedTime) => {
          setArrivalTimePickerVisible(false);
          
          // Ensure arrival time is after departure time
          if (selectedTime > departureTime) {
            setArrivalTime(selectedTime);
          } else {
            Alert.alert('Invalid Time', 'Arrival time must be after departure time');
          }
        }}
        onCancel={() => setArrivalTimePickerVisible(false)}
      />
      
      {/* Notification Picker Modal */}
      {isNotificationPickerVisible && (
        <Modal
          visible={isNotificationPickerVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setNotificationPickerVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.pickerModalContainer}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Notification Time</Text>
                <TouchableOpacity onPress={() => setNotificationPickerVisible(false)}>
                  <X size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.pickerOptions}>
                {[
                  '30 minutes before',
                  '1 hour before',
                  '2 hours before',
                  '3 hours before',
                  '1 day before',
                  '2 days before'
                ].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.pickerOption,
                      notificationTime === option && styles.pickerOptionSelected
                    ]}
                    onPress={() => {
                      setNotificationTime(option);
                      setNotificationPickerVisible(false);
                    }}
                  >
                    <Text 
                      style={[
                        styles.pickerOptionText,
                        notificationTime === option && styles.pickerOptionTextSelected
                      ]}
                    >
                      {option}
                    </Text>
                    {notificationTime === option && (
                      <Check size={20} color="#0A2463" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    flex: 1,
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 20 : 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#0A2463',
  },
  addButton: {
    backgroundColor: '#0A2463',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#0A2463',
  },
  calendarNavButton: {
    fontSize: 24,
    color: '#3E92CC',
    paddingHorizontal: 12,
  },
  weekdays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekday: {
    width: 40,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  day: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
  },
  emptyDay: {
    width: 40,
    height: 40,
    margin: 2,
  },
  dayText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  today: {
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
  },
  todayText: {
    fontFamily: 'Inter-Bold',
    color: '#0A2463',
  },
  selectedDay: {
    backgroundColor: '#0A2463',
    borderRadius: 20,
  },
  selectedDayText: {
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  flightIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3E92CC',
    marginTop: 2,
  },
  scheduleSection: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#0A2463',
    marginLeft: 8,
  },
  flightList: {
    paddingBottom: 40,
  },
  flightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  flightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  flightTime: {
    flex: 1,
  },
  flightTimeText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#0A2463',
  },
  flightStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  flightStatusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  flightRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  airport: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  airportCode: {
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#0A2463',
  },
  routeLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  flightDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  flightAircraft: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  flightDuration: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  notificationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 8,
  },
  notificationText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#475569',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 16,
  },
  scheduleButton: {
    backgroundColor: '#0A2463',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  scheduleButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: 650,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#0A2463',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 16,
    flex: 1,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#4B5563',
    marginBottom: 8,
  },
  formInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    height: 48,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  inputText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  typeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  typeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
    marginBottom: 8,
  },
  typeOptionSelected: {
    backgroundColor: '#0A2463',
  },
  typeOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#475569',
  },
  typeOptionTextSelected: {
    color: '#FFFFFF',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    backgroundColor: '#0A2463',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  pickerModalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: 400,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  pickerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#0A2463',
  },
  pickerOptions: {
    padding: 16,
  },
  pickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  pickerOptionSelected: {
    backgroundColor: '#F1F5F9',
  },
  pickerOptionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  pickerOptionTextSelected: {
    fontFamily: 'Inter-Medium',
    color: '#0A2463',
  },
});