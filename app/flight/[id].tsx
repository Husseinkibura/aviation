// app/flight/[id].tsx

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  SafeAreaView,
  Platform,
  Image,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Clock, Calendar, Plane, MapPin, TriangleAlert as AlertTriangle, FileText, Trash2, CreditCard as Edit, Share2 } from 'lucide-react-native';
import { useUserData } from '@/contexts/UserDataContext';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';

// Add these formatting functions
const formatDate = (isoDate: string) => {
  return format(new Date(isoDate), 'MMM d, yyy');
};

const formatTime = (timeString: string) => {
  const date = new Date(`1970-01-01T${timeString}`);
  return format(date, 'hh:mm a');
};

const formatDuration = (totalHours: number) => {
  const hours = Math.floor(totalHours);
  const minutes = Math.round((totalHours - hours) * 60);
  return `${hours}h ${minutes}m`;
};

export default function FlightDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { allFlights, deleteFlightLog } = useUserData();
  
  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  useEffect(() => {
    // Find the flight by ID
    const foundFlight = allFlights.find(f => f.id === id);
    
    if (foundFlight) {
      setFlight(foundFlight);
    }
    
    setLoading(false);
  }, [id, allFlights]);
  
  const handleDelete = () => {
    Alert.alert(
      "Delete Flight",
      "Are you sure you want to delete this flight log? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            deleteFlightLog(id as string);
            router.back();
          }
        }
      ]
    );
  };
  
  const handleShare = () => {
    Alert.alert(
      "Share Flight",
      "This would share the flight details via your device's share menu in a real application.",
      [{ text: "OK" }]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0A2463" />
      </View>
    );
  }

  if (!flight) {
    return (
      <View style={styles.notFoundContainer}>
        <AlertTriangle size={48} color="#F59E0B" />
        <Text style={styles.notFoundText}>Flight not found</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#0A2463" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Flight Details</Text>
          <View style={styles.placeholder} />
        </View>

        <Animated.View entering={FadeIn.duration(400)} style={styles.content}>
        <LinearGradient
          colors={['#0A2463', '#3E92CC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.flightCard}
        >
          <View style={styles.flightCardHeader}>
            <View>
              <Text style={styles.flightCardDate}>{formatDate(flight.date)}</Text>
              <Text style={styles.flightCardTime}>
                {formatTime(flight.departure_time)} - {formatTime(flight.arrival_time)}
              </Text>
            </View>
              <View style={[
                styles.statusBadge, 
                { backgroundColor: flight.status === 'Completed' ? '#4CAF50' : 
                                  flight.status === 'Confirmed' ? '#3E92CC' : '#F59E0B' }
              ]}>
                <Text style={styles.statusText}>{flight.status}</Text>
              </View>
            </View>
            
            <View style={styles.routeContainer}>
              <View style={styles.routePoint}>
                <Text style={styles.routeCode}>{flight.departure}</Text>
              </View>
              <View style={styles.routeLine}>
                <Plane size={24} color="#FFFFFF" style={styles.routePlane} />
              </View>
              <View style={styles.routePoint}>
                <Text style={styles.routeCode}>{flight.arrival}</Text>
              </View>
            </View>
            
            <View style={styles.flightCardFooter}>
            <View style={styles.flightDetail}>
              <Clock size={16} color="#FFFFFF" style={styles.detailIcon} />
              <Text style={styles.detailText}>
                {formatDuration(flight.total_hours)}
              </Text>
            </View>
              <View style={styles.flightDetail}>
                <Plane size={16} color="#FFFFFF" style={styles.detailIcon} />
                <Text style={styles.detailText}>{flight.aircraft}</Text>
              </View>
            </View>
          </LinearGradient>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Flight Route</Text>
            <View style={styles.mapContainer}>
              {!mapLoaded && <ActivityIndicator style={styles.mapLoader} color="#0A2463" />}
              <Image
                source={{ uri: 'https://images.pexels.com/photos/1646870/pexels-photo-1646870.jpeg' }}
                style={styles.mapImage}
                onLoad={() => setMapLoaded(true)}
              />
            </View>
          </View>
          
          <View style={styles.section}>
          <Text style={styles.sectionTitle}>Flight Information</Text>
          <View style={styles.infoCard}>
            {/* Date */}
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Calendar size={20} color="#6B7280" style={styles.infoIcon} />
                <View>
                  <Text style={styles.infoLabel}>Date</Text>
                  <Text style={styles.infoValue}>{formatDate(flight.date)}</Text>
                </View>
              </View>
              {/* Duration */}
              <View style={styles.infoItem}>
                <Clock size={20} color="#6B7280" style={styles.infoIcon} />
                <View>
                  <Text style={styles.infoLabel}>Duration</Text>
                  <Text style={styles.infoValue}>
                    {formatDuration(flight.total_hours)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Departure */}
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <MapPin size={20} color="#6B7280" style={styles.infoIcon} />
                <View>
                  <Text style={styles.infoLabel}>Departure</Text>
                  <Text style={styles.infoValue}>
                    {flight.departure} - {formatTime(flight.departure_time)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Arrival */}
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <MapPin size={20} color="#6B7280" style={styles.infoIcon} />
                <View>
                  <Text style={styles.infoLabel}>Arrival</Text>
                  <Text style={styles.infoValue}>
                    {flight.arrival} - {formatTime(flight.arrival_time)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
          
          {flight.remarks && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Remarks</Text>
              <View style={styles.remarksCard}>
                <Text style={styles.remarksText}>{flight.remarks}</Text>
              </View>
            </View>
          )}
          
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Share2 size={20} color="#0A2463" />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.editButton]}
              onPress={() => Alert.alert(
                "Edit Flight",
                "This would open the flight edit screen in a real application.",
                [{ text: "OK" }]
              )}
            >
              <Edit size={20} color="#FFFFFF" />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDelete}
            >
              <Trash2 size={20} color="#FFFFFF" />
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 20 : 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#0A2463',
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: 16,
  },
  flightCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  flightCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  flightCardDate: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  flightCardTime: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  routePoint: {
    width: 50,
    alignItems: 'center',
  },
  routeCode: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  routeLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    position: 'relative',
  },
  routePlane: {
    position: 'absolute',
    top: -12,
    left: '50%',
    marginLeft: -12,
    transform: [{ rotate: '90deg' }],
  },
  flightCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  flightDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    marginRight: 8,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#0A2463',
    marginBottom: 16,
  },
  mapContainer: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  mapLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
  },
  remarksCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  remarksText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#0A2463',
  },
  editButton: {
    backgroundColor: '#3E92CC',
    borderColor: '#3E92CC',
  },
  editButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  deleteButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  notFoundText: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 24,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#3E92CC',
  },
});