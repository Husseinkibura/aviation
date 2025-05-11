// app/(tabs)/logbook.tsx

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  SafeAreaView,
  Platform,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Calendar, Timer, Plane, PlaneTakeoff, PlaneLanding as PlaneLoanding, X, Check, Search, ListFilter } from 'lucide-react-native';
import { useUserData } from '@/contexts/UserDataContext';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import DateTimePickerModal from '@/components/DateTimePickerModal';
import { useToast } from '@/contexts/ToastContext';

export default function LogbookScreen() {
  const router = useRouter();
  const { addFlightLog, allFlights, refreshData } = useUserData();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filteredFlights, setFilteredFlights] = useState(allFlights);
  
  // New flight form state
  const [date, setDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [aircraft, setAircraft] = useState('');
  const [departureTime, setDepartureTime] = useState(new Date());
  const [isDepartureTimePickerVisible, setDepartureTimePickerVisible] = useState(false);
  const [arrivalTime, setArrivalTime] = useState(new Date(Date.now() + 3600000)); // +1 hour
  const [isArrivalTimePickerVisible, setArrivalTimePickerVisible] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [flightType, setFlightType] = useState('');
  const { showToast } = useToast();
  const { deleteFlightLog } = useUserData();
  
  // Filter state
  const [dateFilter, setDateFilter] = useState('');
  const [aircraftFilter, setAircraftFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    refreshData();
  }, []);
  
  useEffect(() => {
    filterFlights();
  }, [searchQuery, allFlights, dateFilter, aircraftFilter, typeFilter]);

  const filterFlights = () => {
    let filtered = [...allFlights];
    
    if (searchQuery) {
      filtered = filtered.filter(flight => 
        flight.departure.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flight.arrival.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flight.aircraft.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (dateFilter) {
      filtered = filtered.filter(flight => flight.date === dateFilter);
    }
    
    if (aircraftFilter) {
      filtered = filtered.filter(flight => 
        flight.aircraft.toLowerCase().includes(aircraftFilter.toLowerCase())
      );
    }
    
    if (typeFilter) {
      filtered = filtered.filter(flight => 
        flight.type && flight.type.toLowerCase() === typeFilter.toLowerCase()
      );
    }
    
    setFilteredFlights(filtered);
  };

  const convertTo24Hour = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleDeleteFlight = async (id: string) => {
    try {
      await deleteFlightLog(id);
      showToast('Flight log deleted successfully', 'success');
    } catch (error) {
      showToast('Failed to delete flight log', 'error');
    }
  };

  const handleAddFlight = () => {
    if (!departure || !arrival || !aircraft) {
      showToast('Flight log added successfully', 'success');
      return;
    }
    
    // const departureTimeStr = departureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    // const arrivalTimeStr = arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const departureTimeStr = convertTo24Hour(departureTime);
    const arrivalTimeStr = convertTo24Hour(arrivalTime);

    // Calculate duration
    const durationMs = arrivalTime.getTime() - departureTime.getTime();
    const totalHours = durationMs / (1000 * 60 * 60);
    const durationHours = Math.floor(totalHours);
    const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const durationStr = `${durationHours}h ${durationMinutes}m`;
    
    // const dateStr = date.toLocaleDateString('en-US', { 
    //   month: 'short', 
    //   day: 'numeric',
    //   year: 'numeric'
    // });

    const dateStr = date.toISOString().split('T')[0];
    
    const newFlight = {
      id: String(Date.now()),
      date: dateStr,
      departure,
      arrival,
      aircraft,
      departureTime: departureTimeStr,
      arrivalTime: arrivalTimeStr,
      duration: durationStr,
      remarks,
      total_hours: totalHours.toFixed(1),
      type: flightType,
      status: 'Completed'
    };
    
    addFlightLog(newFlight);
    resetForm();
    setIsModalVisible(false);
  };
  
  const resetForm = () => {
    setDate(new Date());
    setDeparture('');
    setArrival('');
    setAircraft('');
    setDepartureTime(new Date());
    setArrivalTime(new Date(Date.now() + 3600000));
    setRemarks('');
    setFlightType('');
  };
  
  const resetFilters = () => {
    setDateFilter('');
    setAircraftFilter('');
    setTypeFilter('');
    setIsFilterVisible(false);
  };

  const renderFlightItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.flightCard}
      onPress={() => router.push(`/flight/${item.id}`)}
    >
      <View style={styles.flightHeader}>
        <View style={styles.flightTime}>
          <Text style={styles.flightDate}>{item.date}</Text>
          <Text style={styles.flightTimeText}>{item.departureTime} - {item.arrivalTime}</Text>
        </View>
        <View style={styles.completedStatus}>
          <Text style={styles.completedStatusText}>Completed</Text>
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
      
      {item.type && (
        <View style={styles.typeTag}>
          <Text style={styles.typeTagText}>{item.type}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Flight Logbook</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setIsModalVisible(true)}
          >
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color="#6B7280" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search flights..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setIsFilterVisible(true)}
          >
            <ListFilter size={20} color="#0A2463" />
          </TouchableOpacity>
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
            <Plane size={48} color="#CBD5E1" />
            <Text style={styles.emptyStateText}>No flight logs yet</Text>
            <Text style={styles.emptyStateSubText}>
              Add your first flight by tapping the + button
            </Text>
          </View>
        )}
      </View>
      
      {/* Add Flight Modal */}
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
              <Text style={styles.modalTitle}>Add Flight Log</Text>
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
                  <Text style={styles.inputText}>
                    {date.toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
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
                    <Timer size={20} color="#6B7280" style={styles.inputIcon} />
                    <Text style={styles.inputText}>
                      {departureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.formLabel}>Arrival Time</Text>
                  <TouchableOpacity 
                    style={styles.formInput}
                    onPress={() => setArrivalTimePickerVisible(true)}
                  >
                    <Timer size={20} color="#6B7280" style={styles.inputIcon} />
                    <Text style={styles.inputText}>
                      {arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </TouchableOpacity>
                </View>
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
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Remarks</Text>
                <View style={[styles.formInput, styles.textareaInput]}>
                  <TextInput
                    style={styles.textarea}
                    placeholder="Enter any additional notes..."
                    value={remarks}
                    onChangeText={setRemarks}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
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
                onPress={handleAddFlight}
              >
                <Check size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.saveButtonText}>Save Flight</Text>
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
      
      {/* Filter Modal */}
      <Modal
        visible={isFilterVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsFilterVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            entering={FadeInUp.duration(300)}
            style={[styles.modalContainer, { height: 380 }]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Flights</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setIsFilterVisible(false)}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Date</Text>
                <View style={styles.formInput}>
                  <Calendar size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Apr 15, 2025"
                    value={dateFilter}
                    onChangeText={setDateFilter}
                  />
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Aircraft</Text>
                <View style={styles.formInput}>
                  <Plane size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Aircraft Type/Registration"
                    value={aircraftFilter}
                    onChangeText={setAircraftFilter}
                  />
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Flight Type</Text>
                <View style={styles.typeOptions}>
                  {['Training', 'Commercial', 'Cross-Country', 'Instrument'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeOption,
                        typeFilter === type.toLowerCase() && styles.typeOptionSelected
                      ]}
                      onPress={() => setTypeFilter(
                        typeFilter === type.toLowerCase() ? '' : type.toLowerCase()
                      )}
                    >
                      <Text 
                        style={[
                          styles.typeOptionText,
                          typeFilter === type.toLowerCase() && styles.typeOptionTextSelected
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={resetFilters}
              >
                <Text style={styles.cancelButtonText}>Reset</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={() => setIsFilterVisible(false)}
              >
                <Check size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.saveButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
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
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
  flightTime: {},
  flightDate: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#0A2463',
  },
  flightTimeText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  completedStatus: {
    backgroundColor: '#3E92CC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  completedStatusText: {
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
  typeTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 8,
  },
  typeTagText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#475569',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  emptyStateText: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    textAlign: 'center',
    paddingHorizontal: 32,
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
  textareaInput: {
    height: 120,
    alignItems: 'flex-start',
    paddingTop: 12,
  },
  textarea: {
    flex: 1,
    width: '100%',
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
});