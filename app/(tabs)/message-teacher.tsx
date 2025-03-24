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
  Alert,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useSelector } from 'react-redux';
import { io } from "socket.io-client";
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const API_URL = "https://school-connect-server.up.railway.app";
const socket = io(API_URL);

interface User {
  id: string;
  name: string;
  role: 'Student' | 'Teacher' | 'Intern';
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  receiverName: string;
  text: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  attachments?: string[];
  systemMessage?: boolean;
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
  typingUser: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ isTyping, colors, typingUser }) => {
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
      <ThemedText style={styles.typingText}>{typingUser} is typing</ThemedText>
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
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const currentColors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [attachmentMenuVisible, setAttachmentMenuVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const [chatPartners, setChatPartners] = useState<User[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<User | null>(null);
  
  // Get the current user from Redux state
  const currentUser = useSelector((state: any) => state.auth.user);
  
  // Functions to handle partner selection
  // Functions to handle partner selection
const fetchChatPartners = async () => {
  try {
    setIsLoading(true);
    
    // For students, fetch teachers; for teachers, fetch students
    const endpoint = currentUser.role === 'Student' ? 'teachers' : 'students';
    
    try {
      // Try to fetch from API
      const response = await axios.get(`${API_URL}/users/${endpoint}`);
      setChatPartners(response.data);
    } catch (apiError) {
      console.log("API not available, using mock data");
      
      // If API fails, use mock data
      const mockPartners: User[] = currentUser.role === 'Student' 
        ? [
            { id: 't1', name: 'Mrs. Johnson', role: 'Teacher' },
            { id: 't2', name: 'Mr. Smith', role: 'Teacher' },
            { id: 't3', name: 'Ms. Williams', role: 'Teacher' }
          ]
        : [
            { id: 's1', name: 'John Doe', role: 'Student' },
            { id: 's2', name: 'Jane Smith', role: 'Student' },
            { id: 's3', name: 'Mike Johnson', role: 'Student' }
          ];
      
      setChatPartners(mockPartners);
    }
    
    setIsLoading(false);
  } catch (err) {
    setError('Failed to load chat partners');
    setIsLoading(false);
  }
};

  // Initial setup
  useEffect(() => {
    fetchChatPartners();
    
    // Connect socket and set up listeners
    socket.connect();
    
    socket.on('connect', () => {
      socket.emit('join_chat', { userId: currentUser.id });
    });
    
    return () => {
      socket.off('connect');
      socket.disconnect();
    };
  }, [currentUser.id]);
  
  // Set up message listeners when a partner is selected
  useEffect(() => {
    if (!selectedPartner) return;
    
    // Fetch existing messages
    // Fetch existing messages
const fetchMessages = async () => {
  try {
    setIsLoading(true);
    
    try {
      // Try API first
      const response = await axios.get(`${API_URL}/messages`, {
        params: {
          senderId: currentUser.id,
          receiverId: selectedPartner.id
        }
      });
      
      if (response.data.length === 0) {
        createWelcomeMessage();
      } else {
        setMessages(response.data);
        markMessagesAsRead(response.data);
      }
    } catch (apiError) {
      // Use mock data if API fails
      console.log("Messages API not available, using mock data");
      createWelcomeMessage();
    }
    
    setIsLoading(false);
  } catch (err) {
    setError('Failed to load messages');
    setIsLoading(false);
  }
};

const createWelcomeMessage = () => {
  setMessages([{
    id: 'system-welcome',
    senderId: 'system',
    receiverId: currentUser.id,
    senderName: 'System',
    receiverName: currentUser.name,
    text: `Welcome to your conversation with ${selectedPartner.name}`,
    timestamp: new Date(),
    status: 'read',
    systemMessage: true
  }]);
};

const markMessagesAsRead = (msgs: Message[]) => {
  msgs.forEach((msg: Message) => {
    if (msg.receiverId === currentUser.id && msg.status !== 'read') {
      socket.emit('mark_as_read', { messageId: msg.id });
    }
  });
};
    
    fetchMessages();
    
    // Listen for new messages
    socket.on('new_message', (message: Message) => {
      // Only add message if it's part of this conversation
      if ((message.senderId === currentUser.id && message.receiverId === selectedPartner.id) ||
          (message.senderId === selectedPartner.id && message.receiverId === currentUser.id)) {
        setMessages(prev => [...prev, message]);
        
        // If we received a message, mark it as read
        if (message.receiverId === currentUser.id) {
          socket.emit('mark_as_read', { messageId: message.id });
        }
      }
    });
    
    // Listen for message status updates
    socket.on('message_status_update', (updatedMessage: Message) => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === updatedMessage.id ? updatedMessage : msg
        )
      );
    });
    
    // Listen for typing status
    socket.on('typing_status', ({ userId, isTyping, name }) => {
      if (userId === selectedPartner.id) {
        setIsTyping(isTyping);
        setTypingUser(name);
      }
    });
    
    return () => {
      socket.off('new_message');
      socket.off('message_status_update');
      socket.off('typing_status');
    };
  }, [selectedPartner, currentUser.id]);
  
  // Handle typing status
  // Line 248
  // Handle typing status
  useEffect(() => {
    let typingTimeout: NodeJS.Timeout | null = null;
    
    if (newMessage && selectedPartner) {
      // Emit typing event
      socket.emit('typing', { 
        isTyping: true, 
        receiverId: selectedPartner.id,
        name: currentUser.name
      });
      
      // Clear previous timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      
      // Set timeout to stop typing indicator
      typingTimeout = setTimeout(() => {
        socket.emit('typing', { 
          isTyping: false, 
          receiverId: selectedPartner.id,
          name: currentUser.name
        });
      }, 3000);
    }
    
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [newMessage, selectedPartner]); // Add this closing bracket

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedPartner) return;
  
    const messageData: Omit<Message, 'id'> = {
      senderId: currentUser.id,
      receiverId: selectedPartner.id,
      senderName: currentUser.name,
      receiverName: selectedPartner.name,
      text: newMessage,
      timestamp: new Date(),
      status: 'sent', // This is correct - using literal from union type
    };
  
    try {
      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      const tempMessage = { ...messageData, id: tempId };
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');
  
      try {
        // Try to send to server
        const response = await axios.post(`${API_URL}/messages`, messageData);
        const savedMessage = response.data;
        
        // Update message with server-generated ID
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempId ? { ...savedMessage, status: savedMessage.status as 'sent' | 'delivered' | 'read' } : msg
          )
        );
        
        // Emit socket event for real-time update
        socket.emit('send_message', savedMessage);
      } catch (apiError) {
        console.log("Message API not available, simulating response");
        
        // Mock successful send after a brief delay
        setTimeout(() => {
          const mockSavedMessage = { ...tempMessage, status: 'delivered' as const };
          setMessages(prev => 
            prev.map(msg => 
              msg.id === tempId ? mockSavedMessage : msg
            )
          );
          
          // Simulate read receipt after another delay
          setTimeout(() => {
            const readMessage = { ...mockSavedMessage, status: 'read' as const };
            setMessages(prev => 
              prev.map(msg => 
                msg.id === tempId ? readMessage : msg
              )
            );
          }, 2000);
        }, 1000);
      }
    } catch (err) {
      setError('Failed to send message');
      // Remove the temporary message
      setMessages(prev => prev.filter(msg => msg.id !== `temp-${Date.now()}`));
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
    const isCurrentUser = item.senderId === currentUser.id;
    const isSystem = item.systemMessage === true;

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
            alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
            backgroundColor: isCurrentUser ? currentColors.primary : currentColors.background,
            borderColor: currentColors.border,
          },
        ]}
      >
        <ThemedText
          style={[
            styles.messageText,
            { color: isCurrentUser ? '#ffffff' : currentColors.text },
          ]}
        >
          {item.text}
        </ThemedText>
        <View style={styles.messageFooter}>
          <ThemedText
            style={[
              styles.timestamp,
              { color: isCurrentUser ? '#ffffff' : currentColors.textDim },
            ]}
          >
            {formatTime(new Date(item.timestamp))}
          </ThemedText>
          {isCurrentUser && getMessageStatusIcon(item.status)}
        </View>
      </View>
    );
  };

  const renderPartnerItem = ({ item }: { item: User }) => (
    <TouchableOpacity 
      style={styles.partnerItem}
      onPress={() => setSelectedPartner(item)}
    >
      <View style={styles.partnerAvatar}>
        <ThemedText style={styles.partnerInitials}>
          {item.name.charAt(0).toUpperCase()}
        </ThemedText>
      </View>
      <View style={styles.partnerInfo}>
        <ThemedText style={styles.partnerName}>{item.name}</ThemedText>
        <ThemedText style={styles.partnerRole}>{item.role}</ThemedText>
      </View>
    </TouchableOpacity>
  );

  if (isLoading && !selectedPartner) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={currentColors.primary} />
        <ThemedText style={styles.loadingText}>Loading contacts...</ThemedText>
      </ThemedView>
    );
  }

  if (error && !selectedPartner) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchChatPartners}
        >
          <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  // Show partner selection if no partner is selected
  if (!selectedPartner) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <View style={styles.headerContent}>
            <ThemedText style={styles.headerTitle}>Select Contact</ThemedText>
          </View>
        </ThemedView>
        
        <FlatList
          data={chatPartners}
          renderItem={renderPartnerItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.partnersList}
        />
      </ThemedView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ThemedView style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setSelectedPartner(null)}
          >
            <Ionicons name="arrow-back" size={24} color={currentColors.text} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <ThemedText style={styles.headerTitle}>{selectedPartner.name}</ThemedText>
            <ThemedText style={styles.headerSubtitle}>{selectedPartner.role}</ThemedText>
          </View>
        </View>
      </ThemedView>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={currentColors.primary} />
        </View>
      ) : (
        <>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            inverted
          />

          <TypingIndicator 
            isTyping={isTyping} 
            colors={currentColors} 
            typingUser={typingUser}
          />

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
        </>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
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
  partnersList: {
    padding: 15,
  },
  partnerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  partnerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  partnerInitials: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  partnerInfo: {
    flex: 1,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  partnerRole: {
    fontSize: 14,
    opacity: 0.7,
  },
});