import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Animated,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface Message {
  id: string;
  sender: 'parent' | 'teacher' | 'system';
  text: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  attachments?: string[];
}

// Helper function to format timestamp
const formatTime = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

interface TypingIndicatorProps {
  isTyping: boolean;
  colors: any;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ isTyping, colors }) => {
  const [dots] = useState(new Animated.Value(0));

  useEffect(() => {
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dots, {
            toValue: 3,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(dots, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      dots.setValue(0);
    }
  }, [isTyping]);

  if (!isTyping) return null;

  return (
    <View style={[styles.typingContainer, { backgroundColor: colors.background }]}>
      <ThemedText style={styles.typingText}>Teacher is typing</ThemedText>
      <Animated.View style={styles.dotsContainer}>
        {[0, 1, 2].map((i) => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: colors.text,
                opacity: dots.interpolate({
                  inputRange: [0, 1, 2, 3],
                  outputRange: [0.3, i === 0 ? 1 : 0.3, i === 1 ? 1 : 0.3, i === 2 ? 1 : 0.3],
                }),
              },
            ]}
          />
        ))}
      </Animated.View>
    </View>
  );
};

export default function MessageTeacherScreen() {
  const colorScheme = useColorScheme();
  const currentColors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTeacherTyping, setIsTeacherTyping] = useState(false);
  const [attachmentMenuVisible, setAttachmentMenuVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Simulate initial messages
  useEffect(() => {
    const initialMessages: Message[] = [
      {
        id: '1',
        sender: 'system',
        text: 'Welcome to the chat! You can communicate with the teacher here.',
        timestamp: new Date(Date.now() - 86400000),
        status: 'read',
      },
      {
        id: '2',
        sender: 'teacher',
        text: 'Hello! How can I help you today?',
        timestamp: new Date(Date.now() - 3600000),
        status: 'read',
      },
    ];
    setMessages(initialMessages);
  }, []);

  const simulateTeacherTyping = () => {
    setIsTeacherTyping(true);
    setTimeout(() => setIsTeacherTyping(false), 3000);
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        sender: 'parent',
        text: newMessage,
        timestamp: new Date(),
        status: 'sent',
      };
      setMessages((prev) => [...prev, message]);
      setNewMessage('');
      simulateTeacherTyping();

      // Simulate message status updates
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === message.id ? { ...msg, status: 'delivered' } : msg
          )
        );
      }, 1000);

      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === message.id ? { ...msg, status: 'read' } : msg
          )
        );
      }, 2000);
    }
  };

  const getMessageStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sent':
        return <MaterialIcons name="check" size={16} color={currentColors.textDim} />;
      case 'delivered':
        return <MaterialIcons name="done-all" size={16} color={currentColors.textDim} />;
      case 'read':
        return <MaterialIcons name="done-all" size={16} color={currentColors.primary} />;
      default:
        return null;
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isParent = item.sender === 'parent';
    const isSystem = item.sender === 'system';

    if (isSystem) {
      return (
        <View style={styles.systemMessageContainer}>
          <ThemedText style={styles.systemMessageText}>{item.text}</ThemedText>
        </View>
      );
    }

    return (
      <View
        style={[
          styles.messageContainer,
          {
            alignSelf: isParent ? 'flex-end' : 'flex-start',
            backgroundColor: isParent ? currentColors.primary : currentColors.background,
            borderColor: currentColors.border,
          },
        ]}
      >
        <ThemedText
          style={[
            styles.messageText,
            { color: isParent ? '#ffffff' : currentColors.text },
          ]}
        >
          {item.text}
        </ThemedText>
        <View style={styles.messageFooter}>
          <ThemedText
            style={[
              styles.timestamp,
              { color: isParent ? '#ffffff' : currentColors.textDim },
            ]}
          >
            {formatTime(item.timestamp)}
          </ThemedText>
          {isParent && getMessageStatusIcon(item.status)}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ThemedView style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={currentColors.text} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <ThemedText style={styles.headerTitle}>Mrs. Joyti</ThemedText>
            <ThemedText style={styles.headerSubtitle}>Teacher</ThemedText>
          </View>
        </View>
      </ThemedView>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        inverted
      />

      <TypingIndicator isTyping={isTeacherTyping} colors={currentColors} />

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: currentColors.background,
            borderColor: currentColors.border,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => setAttachmentMenuVisible(!attachmentMenuVisible)}
          style={styles.attachButton}
        >
          <MaterialIcons name="attach-file" size={24} color={currentColors.primary} />
        </TouchableOpacity>

        <TextInput
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          placeholderTextColor={currentColors.textDim}
          style={[
            styles.input,
            {
              backgroundColor: currentColors.inputBg,
              color: currentColors.text,
            },
          ]}
          multiline
        />

        <TouchableOpacity
          onPress={sendMessage}
          style={[
            styles.sendButton,
            {
              backgroundColor: newMessage.trim() ? currentColors.primary : currentColors.textDim,
            },
          ]}
          disabled={!newMessage.trim()}
        >
          <MaterialIcons name="send" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {attachmentMenuVisible && (
        <View
          style={[
            styles.attachmentMenu,
            { backgroundColor: currentColors.background },
          ]}
        >
          {['Photo', 'Document', 'Location'].map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.attachmentOption}
              onPress={() => setAttachmentMenuVisible(false)}
            >
              <MaterialIcons
                name={
                  option === 'Photo'
                    ? 'photo'
                    : option === 'Document'
                    ? 'description'
                    : 'location-on'
                }
                size={24}
                color={currentColors.primary}
              />
              <ThemedText style={styles.attachmentOptionText}>{option}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  messagesList: {
    padding: 15,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 20,
    marginVertical: 5,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 16,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 5,
  },
  timestamp: {
    fontSize: 12,
    marginRight: 5,
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  systemMessageText: {
    fontSize: 12,
    opacity: 0.7,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 10,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachButton: {
    padding: 5,
  },
  attachmentMenu: {
    position: 'absolute',
    bottom: 70,
    left: 0,
    right: 0,
    padding: 15,
    borderTopWidth: 1,
  },
  attachmentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  attachmentOptionText: {
    marginLeft: 10,
    fontSize: 16,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginHorizontal: 10,
    borderRadius: 20,
  },
  typingText: {
    fontSize: 12,
    opacity: 0.7,
    marginRight: 5,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 2,
  },
});