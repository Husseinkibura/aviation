import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUserData } from '@/contexts/UserDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, CalendarClock, History, PlaneLanding, PlaneTakeoff, Navigation, TriangleAlert as AlertTriangle, Sun, Cloud, CloudRain, Wind } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    loading, 
    refreshData, 
    recentFlights,
    upcomingFlights,
    flightStats,
    getWeatherIcon
  } = useUserData();

  useEffect(() => {
    refreshData();
  }, []);

  // Get current time
  const now = new Date();
  const hours = now.getHours();
  let greeting = 'Good Morning';
  
  if (hours >= 12 && hours < 17) {
    greeting = 'Good Afternoon';
  } else if (hours >= 17) {
    greeting = 'Good Evening';
  }

  // Weather simulation (would be fetched from a real API)
  const weatherData = {
    location: 'Dar es Salaam',
    condition: 'Partly Cloudy',
    temperature: 28,
    windSpeed: 10,
    windDirection: 'NE',
    visibility: 'Good'
  };

  const getWeatherIconComponent = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
        return <Sun size={24} color="#FFB600" />;
      case 'partly cloudy':
        return <Cloud size={24} color="#3E92CC" />;
      case 'rainy':
        return <CloudRain size={24} color="#3E92CC" />;
      default:
        return <Cloud size={24} color="#3E92CC" />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshData} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.userName}>{user?.name || 'Pilot'}</Text>
          </View>
          <View style={styles.dateTimeContainer}>
            <Clock size={16} color="#6B7280" />
            <Text style={styles.dateTime}>
              {now.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}
            </Text>
          </View>
        </View>

        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <LinearGradient
            colors={['#0A2463', '#3E92CC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.statsCard}
          >
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Flight Hours</Text>
                <Text style={styles.statValue}>{flightStats.totalHours}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Flights</Text>
                <Text style={styles.statValue}>{flightStats.totalFlights}</Text>
              </View>
            </View>
            <View style={styles.horizontalDivider} />
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>This Month</Text>
                <Text style={styles.statValue}>{flightStats.monthHours}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Aircraft</Text>
                <Text style={styles.statValue}>{flightStats.aircraftCount}</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.duration(400).delay(200)}
          style={styles.weatherCard}
        >
          <View style={styles.weatherHeader}>
            <Text style={styles.weatherTitle}>Flight Conditions</Text>
            <Text style={styles.weatherLocation}>{weatherData.location}</Text>
          </View>
          
          <View style={styles.weatherContent}>
            <View style={styles.weatherMain}>
              {getWeatherIconComponent(weatherData.condition)}
              <Text style={styles.temperature}>{weatherData.temperature}°C</Text>
              <Text style={styles.weatherCondition}>{weatherData.condition}</Text>
            </View>
            
            <View style={styles.weatherDetails}>
              <View style={styles.weatherItem}>
                <Wind size={16} color="#6B7280" />
                <Text style={styles.weatherItemText}>
                  {weatherData.windSpeed} kts {weatherData.windDirection}
                </Text>
              </View>
              <View style={styles.weatherItem}>
                <Navigation size={16} color="#6B7280" />
                <Text style={styles.weatherItemText}>
                  Visibility: {weatherData.visibility}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(300)}>
          <View style={styles.sectionHeader}>
            <CalendarClock size={20} color="#0A2463" />
            <Text style={styles.sectionTitle}>Upcoming Flights</Text>
          </View>

          {upcomingFlights.length > 0 ? (
            upcomingFlights.map((flight, index) => (
              <TouchableOpacity 
                key={flight.id} 
                style={styles.flightCard}
                onPress={() => router.push(`/flight/${flight.id}`)}
              >
                <View style={styles.flightHeader}>
                  <View style={styles.flightTime}>
                    <Text style={styles.flightDate}>{flight.date}</Text>
                    <Text style={styles.flightTimeText}>{flight.departureTime} - {flight.arrivalTime}</Text>
                  </View>
                  <View style={[styles.flightStatus, { backgroundColor: flight.status === 'Confirmed' ? '#4CAF50' : '#FFC107' }]}>
                    <Text style={styles.flightStatusText}>{flight.status}</Text>
                  </View>
                </View>
                
                <View style={styles.flightRoute}>
                  <View style={styles.airport}>
                    <PlaneTakeoff size={16} color="#0A2463" />
                    <Text style={styles.airportCode}>{flight.departure}</Text>
                  </View>
                  <View style={styles.routeLine} />
                  <View style={styles.airport}>
                    <PlaneLanding size={16} color="#0A2463" />
                    <Text style={styles.airportCode}>{flight.arrival}</Text>
                  </View>
                </View>
                
                <View style={styles.flightDetails}>
                  <Text style={styles.flightAircraft}>{flight.aircraft}</Text>
                  <Text style={styles.flightDuration}>{flight.duration}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <CalendarClock size={40} color="#CBD5E1" />
              <Text style={styles.emptyStateText}>No upcoming flights</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => router.push('/schedule')}
              >
                <Text style={styles.addButtonText}>Schedule a Flight</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(400)}>
          <View style={styles.sectionHeader}>
            <History size={20} color="#0A2463" />
            <Text style={styles.sectionTitle}>Recent Flights</Text>
          </View>

          {recentFlights.length > 0 ? (
            recentFlights.map((flight, index) => (
              <TouchableOpacity 
                key={flight.id} 
                style={styles.flightCard}
                onPress={() => router.push(`/flight/${flight.id}`)}
              >
                <View style={styles.flightHeader}>
                  <View style={styles.flightTime}>
                    <Text style={styles.flightDate}>{flight.date}</Text>
                    <Text style={styles.flightTimeText}>{flight.departureTime} - {flight.arrivalTime}</Text>
                  </View>
                  <View style={styles.completedStatus}>
                    <Text style={styles.completedStatusText}>Completed</Text>
                  </View>
                </View>
                
                <View style={styles.flightRoute}>
                  <View style={styles.airport}>
                    <PlaneTakeoff size={16} color="#0A2463" />
                    <Text style={styles.airportCode}>{flight.departure}</Text>
                  </View>
                  <View style={styles.routeLine} />
                  <View style={styles.airport}>
                    <PlaneLanding size={16} color="#0A2463" />
                    <Text style={styles.airportCode}>{flight.arrival}</Text>
                  </View>
                </View>
                
                <View style={styles.flightDetails}>
                  <Text style={styles.flightAircraft}>{flight.aircraft}</Text>
                  <Text style={styles.flightDuration}>{flight.duration}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <History size={40} color="#CBD5E1" />
              <Text style={styles.emptyStateText}>No flight history</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => router.push('/logbook')}
              >
                <Text style={styles.addButtonText}>Add Flight Log</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>

        <View style={styles.alertContainer}>
          <AlertTriangle size={20} color="#F59E0B" />
          <Text style={styles.alertText}>
            Flight safety reminder: Always complete your pre-flight checklist
          </Text>
        </View>

        <View style={styles.footer} />
      </ScrollView>
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
  },
  contentContainer: {
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 20 : 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  userName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#0A2463',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  dateTime: {
    marginLeft: 6,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  statsCard: {
    borderRadius: 16,
    marginBottom: 24,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    color: 'white',
    fontFamily: 'Inter-Bold',
  },
  divider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 12,
  },
  weatherCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 24,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  weatherTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#0A2463',
  },
  weatherLocation: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  weatherContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weatherMain: {
    flex: 1,
    alignItems: 'flex-start',
  },
  temperature: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#0A2463',
    marginTop: 8,
  },
  weatherCondition: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  weatherDetails: {
    flex: 1,
  },
  weatherItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  weatherItemText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#0A2463',
    marginLeft: 8,
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    marginBottom: 24,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#0A2463',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  alertContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  alertText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#92400E',
    flex: 1,
  },
  footer: {
    height: 40,
  },
});