import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
  Animated,
  Dimensions,
  Platform,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface SupportOption {
  icon: string;
  title: string;
  subtitle: string;
  gradient: string[];
  onPress: () => void;
}

const SupportScreen = () => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const scaleAnimation = new Animated.Value(1);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const supportOptions: SupportOption[] = [
    {
      icon: 'chatbubble-outline',
      title: 'Live Chat Support',
      subtitle: 'Connect instantly with our dedicated support team',
      gradient: ['#4CAF50', '#2E7D32'],
      onPress: () => {
        handleOptionPress(0);
        // Implement live chat
      }
    },
    {
      icon: 'mail-outline',
      title: 'Email Assistance',
      subtitle: 'Reach out via email for detailed support',
      gradient: ['#2196F3', '#1565C0'],
      onPress: () => {
        handleOptionPress(1);
        Linking.openURL('mailto:sachinmhetre678@gmail.com');
      }
    },
    {
      icon: 'call-outline',
      title: 'Emergency Hotline',
      subtitle: '24/7 direct support line',
      gradient: ['#F44336', '#C62828'],
      onPress: () => {
        handleOptionPress(2);
        Linking.openURL('tel:+1234567890');
      }
    },
    {
      icon: 'help-circle-outline',
      title: 'Resource Center',
      subtitle: 'Guides & FAQs for parents and teachers',
      gradient: ['#9C27B0', '#6A1B9A'],
      onPress: () => {
        handleOptionPress(3);
        // Implement resource center navigation
      }
    },
    {
      icon: 'calendar-outline',
      title: 'Schedule Meeting',
      subtitle: 'Book a consultation with specialists',
      gradient: ['#FF9800', '#EF6C00'],
      onPress: () => {
        handleOptionPress(4);
        // Implement scheduling
      }
    }
  ];

  const handleOptionPress = (index: number) => {
    setSelectedOption(index);
    
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.log('Haptics not supported');
    }
    
    Animated.sequence([
      Animated.timing(scaleAnimation, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();

    supportOptions[index].onPress();
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header Section */}
      <LinearGradient
        colors={['#673AB7', '#9C27B0']}
        style={styles.header}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <ThemedText style={styles.headerTitle}>
            Support Center
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            How can we help you today?
          </ThemedText>
        </Animated.View>
      </LinearGradient>

      {/* Support Options */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {supportOptions.map((option, index) => (
            <Animated.View
              key={index}
              style={[
                styles.cardContainer,
                {
                  transform: [{ scale: selectedOption === index ? scaleAnimation : 1 }]
                }
              ]}
            >
              <TouchableOpacity
                onPress={() => handleOptionPress(index)}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={option.gradient}
                  style={styles.supportCard}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <View style={styles.iconContainer}>
                    <Ionicons
                      name={option.icon as any}
                      size={32}
                      color="#FFF"
                    />
                  </View>
                  <View style={styles.textContainer}>
                    <ThemedText style={styles.cardTitle}>
                      {option.title}
                    </ThemedText>
                    <ThemedText style={styles.cardSubtitle}>
                      {option.subtitle}
                    </ThemedText>
                  </View>
                  <Ionicons
                    name="chevron-forward-outline"
                    size={20}
                    color="#FFF"
                    style={styles.arrowIcon}
                  />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </Animated.View>
        
        {/* Emergency Contact Section */}
        <View style={styles.emergencyContainer}>
          <ThemedText style={styles.emergencyTitle}>
            Emergency Contact
          </ThemedText>
          <TouchableOpacity
            style={styles.emergencyButton}
            onPress={() => Linking.openURL('tel:911')}
          >
            <Ionicons name="warning-outline" size={24} color="#FF1744" />
            <ThemedText style={styles.emergencyButtonText}>
              Call Emergency Services
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFF',
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 15,
  },
  cardContainer: {
    marginTop: 20,
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  supportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  iconContainer: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
  },
  arrowIcon: {
    marginLeft: 10,
  },
  emergencyContainer: {
    marginTop: 30,
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  emergencyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E8',
    padding: 15,
    borderRadius: 10,
  },
  emergencyButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#FF1744',
    fontWeight: '600',
  },
});

export default SupportScreen;