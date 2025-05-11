// components/Toast.tsx

import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  Dimensions,
  Platform
} from 'react-native';
import { Check, AlertCircle, X } from 'lucide-react-native';

const { width } = Dimensions.get('window');

type ToastType = 'success' | 'error';

interface ToastProps {
  visible: boolean;
  message: string;
  type: ToastType;
  onHide: () => void;
}

export default function Toast({ visible, message, type, onHide }: ToastProps) {
  const translateY = new Animated.Value(-100);

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.spring(translateY, {
          toValue: Platform.OS === 'ios' ? 60 : 40,
          useNativeDriver: true,
          damping: 15,
          mass: 1,
          stiffness: 200,
        }),
        Animated.delay(2000),
        Animated.spring(translateY, {
          toValue: -100,
          useNativeDriver: true,
          damping: 15,
          mass: 1,
          stiffness: 200,
        }),
      ]).start(() => onHide());
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY }] },
        type === 'success' ? styles.successBg : styles.errorBg,
      ]}
    >
      <View style={styles.content}>
        {type === 'success' ? (
          <Check size={24} color="#FFFFFF" />
        ) : (
          <AlertCircle size={24} color="#FFFFFF" />
        )}
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    maxWidth: width - 40,
    borderRadius: 12,
    padding: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 1000,
  },
  successBg: {
    backgroundColor: '#4CAF50',
  },
  errorBg: {
    backgroundColor: '#EF4444',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  message: {
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    flex: 1,
  },
});