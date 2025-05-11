import { 
    View, 
    Text, 
    StyleSheet, 
    Image, 
    TouchableOpacity, 
    Dimensions, 
    Platform 
  } from 'react-native';
  import { useRouter } from 'expo-router';
  import { LinearGradient } from 'expo-linear-gradient';
  import { Plane } from 'lucide-react-native';
  import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withTiming,
    withDelay,
    FadeIn
  } from 'react-native-reanimated';
  
  const { width, height } = Dimensions.get('window');
  
  export default function WelcomeScreen() {
    const router = useRouter();
    const buttonOpacity = useSharedValue(0);
    
    // Start animation after component mounts
    setTimeout(() => {
      buttonOpacity.value = withDelay(1000, withTiming(1, { duration: 800 }));
    }, 500);
    
    const buttonAnimatedStyle = useAnimatedStyle(() => {
      return {
        opacity: buttonOpacity.value,
        transform: [{ translateY: withTiming(buttonOpacity.value * 0, { duration: 800 }) }]
      };
    });
  
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#0A2463', '#3E92CC']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <Animated.View entering={FadeIn.duration(1000).delay(300)} style={styles.logoContainer}>
            <Plane color="#FFF" size={56} strokeWidth={1.5} />
            <Text style={styles.logoText}>Digital Pilot Logbook</Text>
            <Text style={styles.subText}>Your Complete Aviation Companion</Text>
          </Animated.View>
          
          <Image 
            source={{ uri: 'https://images.pexels.com/photos/3769139/pexels-photo-3769139.jpeg' }} 
            style={styles.backgroundImage} 
            resizeMode="cover"
          />
          
          <Animated.View style={[styles.buttonContainer, buttonAnimatedStyle]}>
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => router.push('/login')}
            >
              <Text style={styles.buttonText}>Log In</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton]} 
              onPress={() => router.push('/register')}
            >
              <Text style={styles.secondaryButtonText}>Create Account</Text>
            </TouchableOpacity>
            
            <View style={styles.privacyContainer}>
              <Text style={styles.privacyText}>
                By continuing, you agree to our Terms of Service and Privacy Policy
              </Text>
            </View>
          </Animated.View>
        </LinearGradient>
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    gradient: {
      flex: 1,
      justifyContent: 'space-between',
      paddingTop: Platform.OS === 'ios' ? 60 : 40,
    },
    logoContainer: {
      alignItems: 'center',
      marginTop: height * 0.05,
      marginBottom: 40,
    },
    logoText: {
      color: '#FFFFFF',
      fontSize: 28,
      fontFamily: 'Inter-Bold',
      marginTop: 12,
    },
    subText: {
      color: '#FFFFFF',
      opacity: 0.85,
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      marginTop: 8,
    },
    backgroundImage: {
      width: width,
      height: height * 0.4,
      position: 'absolute',
      bottom: 0,
      opacity: 0.2,
    },
    buttonContainer: {
      padding: 24,
      paddingBottom: Platform.OS === 'ios' ? 40 : 24,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 1,
      borderBottomWidth: 0,
    },
    button: {
      backgroundColor: '#FFD700',
      paddingVertical: 16,
      borderRadius: 10,
      alignItems: 'center',
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    buttonText: {
      color: '#0A2463',
      fontSize: 16,
      fontFamily: 'Inter-Bold',
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      borderColor: '#FFFFFF',
      borderWidth: 1,
    },
    secondaryButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontFamily: 'Inter-Bold',
    },
    privacyContainer: {
      marginTop: 16,
      alignItems: 'center',
    },
    privacyText: {
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      textAlign: 'center',
    },
  });