import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
  StatusBar,
  StyleSheet,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

interface SupportOption {
  icon: string;
  title: string;
  subtitle: string;
  gradient: string[];
  onPress: () => void;
}

const SupportScreen = () => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

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
        Linking.openURL('mailto:support@schoolconnect.com');
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
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log('Haptics not supported');
    }

    supportOptions[index].onPress();
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="transparent" 
        translucent={true}
      />
      
      {/* Header Section */}
      <LinearGradient
        colors={['#673AB7', '#9C27B0']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>
            Support Center
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            How can we help you today?
          </ThemedText>
        </View>
      </LinearGradient>

      {/* Support Options */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {supportOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleOptionPress(index)}
            activeOpacity={0.7}
            style={[
              styles.cardContainer,
              selectedOption === index && styles.selectedCard
            ]}
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
        ))}
        
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
    paddingTop: Platform.OS === 'android' 
      ? StatusBar.currentHeight 
      : height * 0.05,
    paddingBottom: height * 0.02,
    paddingHorizontal: width * 0.05,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerContent: {
    marginTop: Platform.OS === 'ios' ? height * 0.02 : 0,
  },
  headerTitle: {
    fontSize: width * 0.07,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: width * 0.04,
    color: '#FFF',
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: width * 0.04,
    paddingBottom: height * 0.02,
  },
  cardContainer: {
    marginTop: height * 0.02,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  selectedCard: {
    transform: [{ scale: 0.98 }],
  },
  supportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: width * 0.04,
    borderRadius: 15,
    overflow: 'hidden',
  },
  iconContainer: {
    width: width * 0.15,
    height: width * 0.15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: width * 0.075,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: width * 0.04,
  },
  cardTitle: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: width * 0.035,
    color: '#FFF',
    opacity: 0.9,
  },
  arrowIcon: {
    marginLeft: width * 0.02,
  },
  emergencyContainer: {
    marginTop: height * 0.03,
    marginBottom: height * 0.02,
    padding: width * 0.05,
    backgroundColor: '#FFF',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  emergencyTitle: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: height * 0.02,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E8',
    padding: width * 0.04,
    borderRadius: 10,
  },
  emergencyButtonText: {
    marginLeft: width * 0.03,
    fontSize: width * 0.04,
    color: '#FF1744',
    fontWeight: '600',
  },
});

export default SupportScreen;