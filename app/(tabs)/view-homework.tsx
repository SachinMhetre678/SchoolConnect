import React, { useState } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
  ScrollView,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface Homework {
  id: string;
  subject: string;
  description: string;
  dueDate: Date;
  status: 'pending' | 'completed' | 'overdue';
  priority: 'high' | 'medium' | 'low';
  attachments?: number;
  teacherNotes?: string;
}

export default function ViewHomeworkScreen() {
  const colorScheme = useColorScheme();
  const currentColors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const [homeworks, setHomeworks] = useState<Homework[]>([
    {
      id: '1',
      subject: 'Mathematics',
      description: 'Complete exercises 5.2 and 5.3 from textbook. Focus on algebraic equations and show all working steps.',
      dueDate: new Date('2024-02-10'),
      status: 'pending',
      priority: 'high',
      attachments: 2,
      teacherNotes: 'Please submit with proper working steps'
    },
    {
      id: '2',
      subject: 'Science',
      description: 'Create a model of the solar system showing all planets and their relative distances.',
      dueDate: new Date('2024-02-15'),
      status: 'pending',
      priority: 'medium',
      attachments: 1,
      teacherNotes: 'Use the reference material shared in class'
    },
    {
      id: '3',
      subject: 'English',
      description: 'Write a 500-word essay on the theme of friendship in Shakespeare\'s works',
      dueDate: new Date('2024-02-05'),
      status: 'overdue',
      priority: 'high',
      teacherNotes: 'Focus on at least two plays'
    },
    {
      id: '4',
      subject: 'Mathematics',
      description: 'Practice geometric constructions from Chapter 7',
      dueDate: new Date('2024-02-08'),
      status: 'completed',
      priority: 'medium',
      attachments: 3
    }
  ]);

  const subjects = Array.from(new Set(homeworks.map(hw => hw.subject)));

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#ff4444';
      case 'medium':
        return '#ffaa00';
      case 'low':
        return '#00c851';
      default:
        return currentColors.text;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#00c851';
      case 'overdue':
        return '#ff4444';
      default:
        return currentColors.primary;
    }
  };

  const formatDueDate = (date: Date) => {
    const today = new Date();
    const dueDate = new Date(date);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due Today';
    if (diffDays === 1) return 'Due Tomorrow';
    if (diffDays <= 7) return `Due in ${diffDays} days`;
    return dueDate.toLocaleDateString();
  };

  const toggleHomeworkStatus = (id: string) => {
    setHomeworks(prev => prev.map(hw => {
      if (hw.id === id) {
        const newStatus = hw.status === 'completed' ? 'pending' : 'completed';
        return { ...hw, status: newStatus };
      }
      return hw;
    }));
  };

  const showHomeworkDetails = (homework: Homework) => {
    Alert.alert(
      homework.subject,
      `Description: ${homework.description}\n\nDue: ${formatDueDate(homework.dueDate)}\n\nPriority: ${homework.priority}\n${homework.teacherNotes ? `\nTeacher Notes: ${homework.teacherNotes}` : ''}`,
      [
        { text: 'Mark as ' + (homework.status === 'completed' ? 'Pending' : 'Completed'), 
          onPress: () => toggleHomeworkStatus(homework.id) },
        { text: 'Close' }
      ]
    );
  };

  const filteredHomeworks = homeworks.filter(hw => {
    if (selectedSubject && hw.subject !== selectedSubject) return false;
    if (selectedFilter === 'pending' && hw.status !== 'pending') return false;
    if (selectedFilter === 'completed' && hw.status !== 'completed') return false;
    return true;
  });

  const renderHomeworkItem = ({ item }: { item: Homework }) => {
    const scaleValue = new Animated.Value(1);

    const onPressIn = () => {
      Animated.spring(scaleValue, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    };

    const onPressOut = () => {
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    return (
      <TouchableOpacity
        onPress={() => showHomeworkDetails(item)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={0.7}
      >
        <Animated.View
          style={[
            styles.homeworkCard,
            {
              backgroundColor: currentColors.background,
              borderColor: currentColors.border,
              transform: [{ scale: scaleValue }],
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.subjectContainer}>
              <View
                style={[
                  styles.priorityIndicator,
                  { backgroundColor: getPriorityColor(item.priority) },
                ]}
              />
              <ThemedText style={styles.subjectText}>{item.subject}</ThemedText>
            </View>
            <TouchableOpacity onPress={() => toggleHomeworkStatus(item.id)}>
              <MaterialIcons
                name={item.status === 'completed' ? 'check-circle' : 'radio-button-unchecked'}
                size={24}
                color={getStatusColor(item.status)}
              />
            </TouchableOpacity>
          </View>
          
          <ThemedText style={styles.description} numberOfLines={2}>
            {item.description}
          </ThemedText>
          
          <View style={styles.cardFooter}>
            <View style={styles.dueDateContainer}>
              <MaterialIcons name="event" size={16} color={currentColors.textDim} />
              <ThemedText style={styles.dueDate}>
                {formatDueDate(item.dueDate)}
              </ThemedText>
            </View>
            
            {item.attachments && (
              <View style={styles.attachmentContainer}>
                <MaterialIcons name="attachment" size={16} color={currentColors.textDim} />
                <ThemedText style={styles.attachmentText}>
                  {item.attachments}
                </ThemedText>
              </View>
            )}
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Homework</ThemedText>
        <TouchableOpacity style={styles.filterButton}>
          <MaterialIcons name="filter-list" size={24} color={currentColors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.subjectFilter}
      >
        <TouchableOpacity
          style={[
            styles.filterChip,
            {
              backgroundColor: !selectedSubject ? currentColors.primary : currentColors.background,
              borderColor: currentColors.border,
            },
          ]}
          onPress={() => setSelectedSubject(null)}
        >
          <ThemedText
            style={[
              styles.filterChipText,
              { color: !selectedSubject ? '#ffffff' : currentColors.text },
            ]}
          >
            All Subjects
          </ThemedText>
        </TouchableOpacity>
        {subjects.map((subject) => (
          <TouchableOpacity
            key={subject}
            style={[
              styles.filterChip,
              {
                backgroundColor:
                  selectedSubject === subject ? currentColors.primary : currentColors.background,
                borderColor: currentColors.border,
              },
            ]}
            onPress={() => setSelectedSubject(subject)}
          >
            <ThemedText
              style={[
                styles.filterChipText,
                { color: selectedSubject === subject ? '#ffffff' : currentColors.text },
              ]}
            >
              {subject}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.statusFilter}>
        {(['all', 'pending', 'completed'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.statusButton,
              {
                backgroundColor:
                  selectedFilter === filter ? currentColors.primary : currentColors.background,
                borderColor: currentColors.border,
              },
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <ThemedText
              style={[
                styles.statusButtonText,
                { color: selectedFilter === filter ? '#ffffff' : currentColors.text },
              ]}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredHomeworks}
        renderItem={renderHomeworkItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  filterButton: {
    padding: 8,
  },
  subjectFilter: {
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 14,
  },
  statusFilter: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  statusButtonText: {
    fontSize: 14,
  },
  list: {
    paddingBottom: 16,
  },
  homeworkCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityIndicator: {
    width: 4,
    height: 16,
    borderRadius: 2,
    marginRight: 8,
  },
  subjectText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dueDate: {
    fontSize: 12,
    marginLeft: 4,
    opacity: 0.7,
  },
  attachmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attachmentText: {
    fontSize: 12,
    marginLeft: 4,
    opacity: 0.7,
  },
});