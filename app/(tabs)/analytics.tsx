import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Dimensions
} from 'react-native';
import { useUserData } from '@/contexts/UserDataContext';
import { 
  BarChart, 
  LineChart, 
  PieChart
} from 'react-native-chart-kit';
import { 
  ChartBar, 
  ChartLine, 
  ChartPie, 
  Calendar,
  Map,
  Plane
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const screenWidth = Dimensions.get('window').width - 32;

export default function AnalyticsScreen() {
  const { flightStats, recentFlights } = useUserData();
  const [timeRange, setTimeRange] = useState('month');
  const [chartType, setChartType] = useState('bar');
  
  // Mock data for charts
  const barData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [12, 8, 15, 9, 20, 13],
      }
    ]
  };
  
  const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [18, 25, 22, 28, 32, 38],
        color: () => '#3E92CC',
        strokeWidth: 2
      }
    ],
    legend: ['Flight Hours']
  };
  
  const pieData = [
    {
      name: 'Training',
      hours: 42,
      color: '#3E92CC',
      legendFontColor: '#1F2937',
      legendFontSize: 12
    },
    {
      name: 'Commercial',
      hours: 85,
      color: '#0A2463',
      legendFontColor: '#1F2937',
      legendFontSize: 12
    },
    {
      name: 'Cross-Country',
      hours: 35,
      color: '#FFD700',
      legendFontColor: '#1F2937',
      legendFontSize: 12
    },
    {
      name: 'Instrument',
      hours: 28,
      color: '#4CAF50',
      legendFontColor: '#1F2937',
      legendFontSize: 12
    },
    {
      name: 'Other',
      hours: 14,
      color: '#F59E0B',
      legendFontColor: '#1F2937',
      legendFontSize: 12
    }
  ];
  
  // Calculate total flight hours by aircraft
  const aircraftHours = recentFlights.reduce((aircraft, flight) => {
    const hours = parseFloat(flight.duration.split('h')[0]);
    if (!aircraft[flight.aircraft]) {
      aircraft[flight.aircraft] = 0;
    }
    aircraft[flight.aircraft] += hours;
    return aircraft;
  }, {});

  const chartConfig = {
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(10, 36, 99, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(75, 85, 99, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#3E92CC'
    }
  };

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <BarChart
            data={barData}
            width={screenWidth}
            height={220}
            yAxisLabel=""
            yAxisSuffix="h"
            chartConfig={chartConfig}
            style={styles.chart}
          />
        );
      case 'line':
        return (
          <LineChart
            data={lineData}
            width={screenWidth}
            height={220}
            yAxisLabel=""
            yAxisSuffix="h"
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        );
      case 'pie':
        return (
          <PieChart
            data={pieData}
            width={screenWidth}
            height={220}
            chartConfig={chartConfig}
            accessor="hours"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
            style={styles.chart}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
        </View>
        
        <View style={styles.statsRow}>
          <Animated.View 
            entering={FadeInDown.duration(400).delay(100)}
            style={styles.statCard}
          >
            <View style={styles.statIconContainer}>
              <Plane size={20} color="#3E92CC" />
            </View>
            <Text style={styles.statTitle}>Total Hours</Text>
            <Text style={styles.statValue}>{flightStats.totalHours}</Text>
          </Animated.View>
          
          <Animated.View 
            entering={FadeInDown.duration(400).delay(200)}
            style={styles.statCard}
          >
            <View style={[styles.statIconContainer, styles.orangeIcon]}>
              <Calendar size={20} color="#F59E0B" />
            </View>
            <Text style={styles.statTitle}>This Month</Text>
            <Text style={styles.statValue}>{flightStats.monthHours}</Text>
          </Animated.View>
          
          <Animated.View 
            entering={FadeInDown.duration(400).delay(300)}
            style={styles.statCard}
          >
            <View style={[styles.statIconContainer, styles.greenIcon]}>
              <Map size={20} color="#4CAF50" />
            </View>
            <Text style={styles.statTitle}>Flights</Text>
            <Text style={styles.statValue}>{flightStats.totalFlights}</Text>
          </Animated.View>
        </View>
        
        <Animated.View 
          entering={FadeInDown.duration(400).delay(400)}
          style={styles.chartContainer}
        >
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Flight Hours</Text>
            <View style={styles.tabsContainer}>
              <TouchableOpacity 
                style={[styles.tabButton, timeRange === 'month' && styles.activeTab]}
                onPress={() => setTimeRange('month')}
              >
                <Text style={[styles.tabText, timeRange === 'month' && styles.activeTabText]}>
                  Month
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tabButton, timeRange === 'year' && styles.activeTab]}
                onPress={() => setTimeRange('year')}
              >
                <Text style={[styles.tabText, timeRange === 'year' && styles.activeTabText]}>
                  Year
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tabButton, timeRange === 'all' && styles.activeTab]}
                onPress={() => setTimeRange('all')}
              >
                <Text style={[styles.tabText, timeRange === 'all' && styles.activeTabText]}>
                  All
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.chartTypes}>
            <TouchableOpacity 
              style={[styles.chartTypeButton, chartType === 'bar' && styles.activeChartType]}
              onPress={() => setChartType('bar')}
            >
              <ChartBar size={20} color={chartType === 'bar' ? '#0A2463' : '#6B7280'} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.chartTypeButton, chartType === 'line' && styles.activeChartType]}
              onPress={() => setChartType('line')}
            >
              <ChartLine size={20} color={chartType === 'line' ? '#0A2463' : '#6B7280'} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.chartTypeButton, chartType === 'pie' && styles.activeChartType]}
              onPress={() => setChartType('pie')}
            >
              <ChartPie size={20} color={chartType === 'pie' ? '#0A2463' : '#6B7280'} />
            </TouchableOpacity>
          </View>
          
          {renderChart()}
        </Animated.View>
        
        <Animated.View 
          entering={FadeInDown.duration(400).delay(500)}
          style={styles.aircraftContainer}
        >
          <Text style={styles.sectionTitle}>Hours by Aircraft</Text>
          
          {Object.entries(aircraftHours).map(([aircraft, hours], index) => (
            <View key={aircraft} style={styles.aircraftItem}>
              <Text style={styles.aircraftName}>{aircraft}</Text>
              <View style={styles.progressContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { width: `${Math.min((hours / parseFloat(flightStats.totalHours)) * 100, 100)}%` }
                  ]} 
                />
              </View>
              <Text style={styles.aircraftHours}>{hours.toFixed(1)}h</Text>
            </View>
          ))}
        </Animated.View>
        
        <Animated.View 
          entering={FadeInDown.duration(400).delay(600)}
          style={styles.insightsContainer}
        >
          <Text style={styles.sectionTitle}>Insights</Text>
          
          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>Flight Efficiency</Text>
            <Text style={styles.insightDescription}>
              Based on your recent flight patterns, you could optimize your scheduling by planning flights earlier in the day for better fuel efficiency.
            </Text>
          </View>
          
          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>Training Recommendation</Text>
            <Text style={styles.insightDescription}>
              You need 8 more hours of instrument training to maintain your currency requirements.
            </Text>
          </View>
          
          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>Monthly Progress</Text>
            <Text style={styles.insightDescription}>
              You've flown 28% more hours this month compared to your monthly average.
            </Text>
          </View>
        </Animated.View>
        
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
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#0A2463',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(62, 146, 204, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  orangeIcon: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  greenIcon: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  statTitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#0A2463',
  },
  chartContainer: {
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
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#0A2463',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 2,
  },
  tabButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tabText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#0A2463',
  },
  chartTypes: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  chartTypeButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  activeChartType: {
    backgroundColor: '#E2E8F0',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  aircraftContainer: {
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
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#0A2463',
    marginBottom: 16,
  },
  aircraftItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  aircraftName: {
    width: 120,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
  },
  progressContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3E92CC',
    borderRadius: 4,
  },
  aircraftHours: {
    width: 45,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    textAlign: 'right',
  },
  insightsContainer: {
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
  insightCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3E92CC',
  },
  insightTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#0A2463',
    marginBottom: 8,
  },
  insightDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
    lineHeight: 20,
  },
  footer: {
    height: 40,
  },
});