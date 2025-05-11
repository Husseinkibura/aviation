import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView,
  Platform,
  ScrollView,
  TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import { History as HistoryIcon, ChevronRight, Search, Filter, PlaneTakeoff, PlaneLanding as PlaneLoanding } from 'lucide-react-native';
import { useUserData } from '@/contexts/UserDataContext';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function HistoryScreen() {
  const router = useRouter();
  const { recentFlights, backupData } = useUserData();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Group flights by month and year
  const groupedFlights = recentFlights.reduce((groups, flight) => {
    const dateParts = flight.date.split(' ');
    // Format: "May 15, 2025" -> "May 2025"
    const monthYear = `${dateParts[0]} ${dateParts[2]}`;
    
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    
    groups[monthYear].push(flight);
    return groups;
  }, {});
  
  // Filter flights based on search query and active tab
  const filteredGroups = Object.entries(groupedFlights).reduce((filtered, [key, flights]) => {
    const filteredFlights = flights.filter(flight => {
      const matchesSearch = 
        !searchQuery || 
        flight.departure.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flight.arrival.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flight.aircraft.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTab = 
        activeTab === 'all' || 
        (activeTab === 'training' && flight.type?.toLowerCase() === 'training') ||
        (activeTab === 'commercial' && flight.type?.toLowerCase() === 'commercial') ||
        (activeTab === 'cross-country' && flight.type?.toLowerCase() === 'cross-country');
      
      return matchesSearch && matchesTab;
    });
    
    if (filteredFlights.length > 0) {
      filtered[key] = filteredFlights;
    }
    
    return filtered;
  }, {});

  const handleExport = () => {
    backupData();
  };

  const renderFlightItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.flightCard}
      onPress={() => router.push(`/flight/${item.id}`)}
    >
      <View style={styles.flightHeader}>
        <Text style={styles.flightDate}>{item.date}</Text>
        <Text style={styles.flightTime}>{item.departureTime} - {item.arrivalTime}</Text>
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
        <View style={styles.durationContainer}>
          <Text style={styles.flightDuration}>{item.duration}</Text>
          <ChevronRight size={16} color="#6B7280" />
        </View>
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
          <Text style={styles.title}>Flight History</Text>
          <TouchableOpacity 
            style={styles.exportButton}
            onPress={handleExport}
          >
            <Text style={styles.exportButtonText}>Export</Text>
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
        </View>
        
        <View style={styles.tabsContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabs}
          >
            <TouchableOpacity
              style={[styles.tab, activeTab === 'all' && styles.activeTab]}
              onPress={() => setActiveTab('all')}
            >
              <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
                All Flights
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === 'training' && styles.activeTab]}
              onPress={() => setActiveTab('training')}
            >
              <Text style={[styles.tabText, activeTab === 'training' && styles.activeTabText]}>
                Training
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === 'commercial' && styles.activeTab]}
              onPress={() => setActiveTab('commercial')}
            >
              <Text style={[styles.tabText, activeTab === 'commercial' && styles.activeTabText]}>
                Commercial
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === 'cross-country' && styles.activeTab]}
              onPress={() => setActiveTab('cross-country')}
            >
              <Text style={[styles.tabText, activeTab === 'cross-country' && styles.activeTabText]}>
                Cross-Country
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
        
        {Object.keys(filteredGroups).length > 0 ? (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {Object.entries(filteredGroups).map(([monthYear, flights], index) => (
              <Animated.View 
                key={monthYear}
                entering={FadeInDown.duration(400).delay(index * 100)}
              >
                <View style={styles.monthHeader}>
                  <Text style={styles.monthTitle}>{monthYear}</Text>
                  <View style={styles.flightCountContainer}>
                    <Text style={styles.flightCount}>{flights.length} flights</Text>
                  </View>
                </View>
                
                {flights.map(flight => renderFlightItem({ item: flight }))}
              </Animated.View>
            ))}
            
            <View style={styles.footer} />
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <HistoryIcon size={48} color="#CBD5E1" />
            <Text style={styles.emptyStateText}>No matching flights found</Text>
            <Text style={styles.emptyStateSubText}>
              Try adjusting your filters or search query
            </Text>
          </View>
        )}
      </View>
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
  exportButton: {
    backgroundColor: '#3E92CC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
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
  tabsContainer: {
    marginBottom: 16,
  },
  tabs: {
    paddingRight: 16,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#F1F5F9',
  },
  activeTab: {
    backgroundColor: '#0A2463',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#475569',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  monthTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#0A2463',
  },
  flightCountContainer: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  flightCount: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#475569',
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
    marginBottom: 12,
  },
  flightDate: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#0A2463',
  },
  flightTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
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
    alignItems: 'center',
  },
  flightAircraft: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flightDuration: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginRight: 4,
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
    marginTop: 40,
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
  },
  footer: {
    height: 40,
  },
});