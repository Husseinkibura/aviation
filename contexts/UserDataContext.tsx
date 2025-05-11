// contexts/UserDataContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { format, addDays } from 'date-fns';
import * as FileSystem from 'expo-file-system';
import { Alert, Platform } from 'react-native';
import * as Sharing from 'expo-sharing';
import axios from 'axios';
import Constants from 'expo-constants';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000/api';

// Types
type Flight = {
  id: string;
  date: string;
  departure: string;
  arrival: string;
  aircraft: string;
  departure_time: string; // Match backend snake_case
  arrival_time: string;   // Match backend snake_case
  total_hours: number;    // Change to number type
  status: string;
  type?: string;
  notification?: string;
};

type FlightStats = {
  totalHours: string;
  totalFlights: string;
  monthHours: string;
  aircraftCount: string;
};

type UserDataContextType = {
  loading: boolean;
  recentFlights: Flight[];
  upcomingFlights: Flight[];
  allFlights: Flight[];
  flightStats: FlightStats;
  refreshData: () => Promise<void>;
  addFlightLog: (flight: Flight) => Promise<void>;
  scheduleNewFlight: (flight: Flight) => Promise<void>;
  deleteFlightLog: (id: string) => Promise<void>;
  backupData: () => Promise<void>;
  restoreData: (data: string) => Promise<void>;
  getWeatherIcon: (condition: string) => string;
};

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export function useUserData() {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
}

type UserDataProviderProps = {
  children: ReactNode;
};

export function UserDataProvider({ children }: UserDataProviderProps) {
  const { user: currentUser } = useAuth(); // Get current user from auth context
  const [loading, setLoading] = useState(false);
  const [recentFlights, setRecentFlights] = useState<Flight[]>([]);
  const [upcomingFlights, setUpcomingFlights] = useState<Flight[]>([]);
  const [flightStats, setFlightStats] = useState<FlightStats>({
    totalHours: '0',
    totalFlights: '0',
    monthHours: '0',
    aircraftCount: '0'
  });

  // Combine recent and upcoming flights for the full logbook
  const allFlights = [...recentFlights, ...upcomingFlights].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB.getTime() - dateA.getTime();
  });

  const refreshData = async () => {
    setLoading(true);
    
    try {
      // Fetch flights
      const flightsResponse = await axios.get(`${API_URL}/flights`);
      setRecentFlights(flightsResponse.data);

      // Fetch analytics
      const analyticsResponse = await axios.get(`${API_URL}/analytics`);
      const { totalHours, totalFlights, aircraftHours } = analyticsResponse.data;

      setFlightStats({
        totalHours: totalHours.toString(),
        totalFlights: totalFlights.toString(),
        monthHours: calculateMonthHours(flightsResponse.data),
        aircraftCount: aircraftHours.length.toString()
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthHours = (flights: Flight[]): string => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return flights
      .filter(flight => {
        const flightDate = new Date(flight.date);
        return flightDate.getMonth() === currentMonth && 
               flightDate.getFullYear() === currentYear;
      })
      .reduce((total, flight) => {
        const hours = parseFloat(flight.duration.split('h')[0]);
        return total + hours;
      }, 0)
      .toFixed(1);
  };

  const addFlightLog = async (flight: Flight) => {
    try {
      const response = await axios.post(`${API_URL}/flights`, flight);
      setRecentFlights(prev => [response.data, ...prev]);
      await refreshData(); // Refresh stats
    } catch (error) {
      console.error('Error adding flight:', error);
      throw new Error('Failed to add flight log');
    }
  };

  // const scheduleNewFlight = async (flight: Flight) => {
  //   try {
  //     const response = await axios.post(`${API_URL}/flights/schedule`, flight);
  //     setUpcomingFlights(prev => [response.data, ...prev]);
  //   } catch (error) {
  //     console.error('Error scheduling flight:', error);
  //     throw new Error('Failed to schedule flight');
  //   }
  // };



  const scheduleNewFlight = async (flight: Flight) => {
    try {
      const response = await axios.post(`${API_URL}/flights/schedule`, {
        ...flight,
        user_id: currentUser?.id,
        // Remove redundant fields, keep snake_case
        total_hours: Number(flight.total_hours.toFixed(1)) // Ensure number type
      });
      
      setUpcomingFlights(prev => [response.data, ...prev]);
      return response.data;
    } catch (error) {
      console.error('Error scheduling flight:', error);
      throw new Error('Failed to schedule flight');
    }
  };

// Add time conversion helper
const convertTo24Hour = (time12h: string) => {
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  
  if (hours === '12') hours = '00';
  if (modifier === 'PM') hours = String(parseInt(hours, 10) + 12);
  
  return `${hours.padStart(2, '0')}:${minutes}:00`;
};

  const deleteFlightLog = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/flights/${id}`);
      
      setRecentFlights(prev => prev.filter(flight => flight.id !== id));
      setUpcomingFlights(prev => prev.filter(flight => flight.id !== id));
      
      await refreshData(); // Refresh stats
    } catch (error) {
      console.error('Error deleting flight:', error);
      throw new Error('Failed to delete flight');
    }
  };

  const backupData = async () => {
    try {
      setLoading(true);
      
      const backupData = {
        recentFlights,
        upcomingFlights,
        flightStats,
        timestamp: new Date().toISOString()
      };
      
      const backupString = JSON.stringify(backupData, null, 2);
      
      if (Platform.OS === 'web') {
        Alert.alert(
          "Backup Data",
          "Copy this JSON data and save it somewhere safe:",
          [{ text: "OK" }]
        );
        return;
      }
      
      const fileUri = `${FileSystem.documentDirectory}pilot_logbook_backup.json`;
      await FileSystem.writeAsStringAsync(fileUri, backupString);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      }
    } catch (error) {
      console.error("Error backing up data:", error);
      Alert.alert("Backup Failed", "There was an error creating your backup.");
    } finally {
      setLoading(false);
    }
  };

  const restoreData = async (data: string) => {
    try {
      setLoading(true);
      
      const backupData = JSON.parse(data);
      
      if (!backupData.recentFlights || !backupData.upcomingFlights || !backupData.flightStats) {
        throw new Error("Invalid backup data format");
      }
      
      // TODO: Implement server-side restore
      Alert.alert("Restore Successful", "Your data has been restored successfully.");
    } catch (error) {
      console.error("Error restoring data:", error);
      Alert.alert("Restore Failed", "There was an error restoring your backup.");
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear':
      case 'sunny':
        return 'sun';
      case 'partly cloudy':
        return 'cloud-sun';
      case 'cloudy':
        return 'cloud';
      case 'rain':
      case 'rainy':
        return 'cloud-rain';
      case 'thunderstorm':
        return 'cloud-lightning';
      case 'snow':
        return 'cloud-snow';
      case 'fog':
      case 'mist':
        return 'cloud-fog';
      default:
        return 'sun';
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const value = {
    loading,
    recentFlights,
    upcomingFlights,
    allFlights,
    flightStats,
    refreshData,
    addFlightLog,
    scheduleNewFlight,
    deleteFlightLog,
    backupData,
    restoreData,
    getWeatherIcon,
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
}



// import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import { format, addDays } from 'date-fns';
// import * as FileSystem from 'expo-file-system';
// import { Alert, Platform } from 'react-native';
// import * as Sharing from 'expo-sharing';

// // Mock data for the application
// const MOCK_RECENT_FLIGHTS = [
//   {
//     id: '1',
//     date: 'May 15, 2025',
//     departure: 'HTDA',
//     arrival: 'HTKJ',
//     aircraft: 'Cessna 172 (5H-AAA)',
//     departureTime: '08:30',
//     arrivalTime: '10:15',
//     duration: '1h 45m',
//     status: 'Completed',
//     type: 'training'
//   },
//   {
//     id: '2',
//     date: 'May 12, 2025',
//     departure: 'HTKJ',
//     arrival: 'HTDA',
//     aircraft: 'Cessna 172 (5H-AAA)',
//     departureTime: '14:45',
//     arrivalTime: '16:30',
//     duration: '1h 45m',
//     status: 'Completed',
//     type: 'training'
//   },
// ];

// const MOCK_UPCOMING_FLIGHTS = [
//   {
//     id: '3',
//     date: format(addDays(new Date(), 2), 'MMM d, yyyy'),
//     departure: 'HTDA',
//     arrival: 'HTAR',
//     aircraft: 'Beechcraft Baron (5H-BRN)',
//     departureTime: '09:00',
//     arrivalTime: '11:30',
//     duration: '2h 30m',
//     status: 'Confirmed',
//     type: 'commercial'
//   },
//   {
//     id: '4',
//     date: format(addDays(new Date(), 5), 'MMM d, yyyy'),
//     departure: 'HTAR',
//     arrival: 'HTDA',
//     aircraft: 'Beechcraft Baron (5H-BRN)',
//     departureTime: '13:30',
//     arrivalTime: '16:00',
//     duration: '2h 30m',
//     status: 'Pending',
//     type: 'commercial'
//   },
// ];

// const MOCK_FLIGHT_STATS = {
//   totalHours: '256.5',
//   totalFlights: '78',
//   monthHours: '12.5',
//   aircraftCount: '4'
// };

// // Types
// type Flight = {
//   id: string;
//   date: string;
//   departure: string;
//   arrival: string;
//   aircraft: string;
//   departureTime: string;
//   arrivalTime: string;
//   duration: string;
//   status: string;
//   type?: string;
//   remarks?: string;
// };

// type FlightStats = {
//   totalHours: string;
//   totalFlights: string;
//   monthHours: string;
//   aircraftCount: string;
// };

// type UserDataContextType = {
//   loading: boolean;
//   recentFlights: Flight[];
//   upcomingFlights: Flight[];
//   allFlights: Flight[];
//   flightStats: FlightStats;
//   refreshData: () => void;
//   addFlightLog: (flight: Flight) => void;
//   scheduleNewFlight: (flight: Flight) => void;
//   deleteFlightLog: (id: string) => void;
//   backupData: () => Promise<void>;
//   restoreData: (data: string) => Promise<void>;
//   getWeatherIcon: (condition: string) => string;
// };

// const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

// export function useUserData() {
//   const context = useContext(UserDataContext);
//   if (!context) {
//     throw new Error('useUserData must be used within a UserDataProvider');
//   }
//   return context;
// }

// type UserDataProviderProps = {
//   children: ReactNode;
// };

// export function UserDataProvider({ children }: UserDataProviderProps) {
//   const [loading, setLoading] = useState(false);
//   const [recentFlights, setRecentFlights] = useState<Flight[]>(MOCK_RECENT_FLIGHTS);
//   const [upcomingFlights, setUpcomingFlights] = useState<Flight[]>(MOCK_UPCOMING_FLIGHTS);
//   const [flightStats, setFlightStats] = useState<FlightStats>(MOCK_FLIGHT_STATS);
  
//   // Combine recent and upcoming flights for the full logbook
//   const allFlights = [...recentFlights, ...upcomingFlights].sort((a, b) => {
//     const dateA = new Date(a.date);
//     const dateB = new Date(b.date);
//     return dateB.getTime() - dateA.getTime(); // Sort descending (newest first)
//   });

//   const refreshData = () => {
//     setLoading(true);
    
//     // Simulate API call or data loading
//     setTimeout(() => {
//       // In a real app, this would fetch fresh data from an API
//       setLoading(false);
//     }, 1000);
//   };

//   const addFlightLog = (flight: Flight) => {
//     // Add to recent flights (completed flights)
//     setRecentFlights(prev => [flight, ...prev]);
    
//     // Update stats
//     setFlightStats(prev => {
//       const hours = parseFloat(prev.totalHours) + parseFloat(flight.duration.split('h')[0]);
//       const monthHours = parseFloat(prev.monthHours) + parseFloat(flight.duration.split('h')[0]);
      
//       return {
//         ...prev,
//         totalHours: hours.toFixed(1),
//         totalFlights: (parseInt(prev.totalFlights) + 1).toString(),
//         monthHours: monthHours.toFixed(1)
//       };
//     });
//   };

//   const scheduleNewFlight = (flight: Flight) => {
//     // Add to upcoming flights
//     setUpcomingFlights(prev => [flight, ...prev]);
//   };

//   const deleteFlightLog = (id: string) => {
//     // Check if flight exists in recent flights
//     const recentFlight = recentFlights.find(flight => flight.id === id);
    
//     if (recentFlight) {
//       setRecentFlights(prev => prev.filter(flight => flight.id !== id));
      
//       // Update stats
//       setFlightStats(prev => {
//         const hours = parseFloat(prev.totalHours) - parseFloat(recentFlight.duration.split('h')[0]);
        
//         return {
//           ...prev,
//           totalHours: hours.toFixed(1),
//           totalFlights: (parseInt(prev.totalFlights) - 1).toString(),
//         };
//       });
//     } else {
//       // Check if flight exists in upcoming flights
//       setUpcomingFlights(prev => prev.filter(flight => flight.id !== id));
//     }
//   };

//   const backupData = async () => {
//     try {
//       setLoading(true);
      
//       // Create backup object
//       const backupData = {
//         recentFlights,
//         upcomingFlights,
//         flightStats,
//         timestamp: new Date().toISOString()
//       };
      
//       const backupString = JSON.stringify(backupData, null, 2);
      
//       if (Platform.OS === 'web') {
//         // For web, create a downloadable file
//         Alert.alert(
//           "Backup Data",
//           "Copy this JSON data and save it somewhere safe:",
//           [{ text: "OK" }]
//         );
//         return;
//       }
      
//       // For native platforms
//       const fileUri = `${FileSystem.documentDirectory}pilot_logbook_backup.json`;
//       await FileSystem.writeAsStringAsync(fileUri, backupString);
      
//       // Share the file
//       if (await Sharing.isAvailableAsync()) {
//         await Sharing.shareAsync(fileUri);
//       }
//     } catch (error) {
//       console.error("Error backing up data:", error);
//       Alert.alert("Backup Failed", "There was an error creating your backup.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const restoreData = async (data: string) => {
//     try {
//       setLoading(true);
      
//       // Parse the backup data
//       const backupData = JSON.parse(data);
      
//       // Validate backup data structure
//       if (!backupData.recentFlights || !backupData.upcomingFlights || !backupData.flightStats) {
//         throw new Error("Invalid backup data format");
//       }
      
//       // Restore the data
//       setRecentFlights(backupData.recentFlights);
//       setUpcomingFlights(backupData.upcomingFlights);
//       setFlightStats(backupData.flightStats);
      
//       Alert.alert("Restore Successful", "Your data has been restored successfully.");
//     } catch (error) {
//       console.error("Error restoring data:", error);
//       Alert.alert("Restore Failed", "There was an error restoring your backup.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getWeatherIcon = (condition: string) => {
//     // Return appropriate icon based on weather condition
//     switch (condition.toLowerCase()) {
//       case 'clear':
//       case 'sunny':
//         return 'sun';
//       case 'partly cloudy':
//         return 'cloud-sun';
//       case 'cloudy':
//         return 'cloud';
//       case 'rain':
//       case 'rainy':
//         return 'cloud-rain';
//       case 'thunderstorm':
//         return 'cloud-lightning';
//       case 'snow':
//         return 'cloud-snow';
//       case 'fog':
//       case 'mist':
//         return 'cloud-fog';
//       default:
//         return 'sun';
//     }
//   };

//   const value = {
//     loading,
//     recentFlights,
//     upcomingFlights,
//     allFlights,
//     flightStats,
//     refreshData,
//     addFlightLog,
//     scheduleNewFlight,
//     deleteFlightLog,
//     backupData,
//     restoreData,
//     getWeatherIcon,
//   };

//   return (
//     <UserDataContext.Provider value={value}>
//       {children}
//     </UserDataContext.Provider>
//   );
// }