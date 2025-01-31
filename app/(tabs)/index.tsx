import {
    Image,
    StyleSheet,
    Platform,
    Animated,
    ScrollView,
    Dimensions,
    TouchableOpacity,
    RefreshControl,
    StatusBar,
    Modal,
    useColorScheme,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { MaterialIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "@/redux/authSlice";
import { RootState } from '@/types';
import { UnknownAction } from '@reduxjs/toolkit';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '@/types';
import { useRouter } from 'expo-router';
import { Href } from 'expo-router/build/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width } = Dimensions.get("window");
type MaterialIconName = keyof typeof MaterialIcons.glyphMap;

// Enhanced interfaces
interface ChildProgress {
    id: string;
    category: string;
    progress: number;
    lastActivity: string;
    mood?: 'focused' | 'calm' | 'happy';
    icon: MaterialIconName; // Changed from string to MaterialIconName
}

const getMoodIcon = (mood: 'focused' | 'calm' | 'happy'): MaterialIconName => {
    switch (mood) {
        case 'focused':
            return 'psychology';
        case 'calm':
            return 'spa';
        case 'happy':
            return 'sentiment-very-satisfied';
        default:
            return 'sentiment-very-satisfied';
    }
}

const getValidIcon = (icon: string): MaterialIconName => {
    // Add mapping for commonly used icons
    const iconMap: Record<string, MaterialIconName> = {
        'school': 'school',
        'people': 'people',
        'stars': 'stars',
        'self-improvement': 'self-improvement',
        'restaurant': 'restaurant',
        'edit': 'edit',
    };

    return iconMap[icon] || 'help-outline';
};


interface ProgressCardProps {
    progress: ChildProgress;
}

interface SchoolRoutine {
    id: string;
    timeStart: string;
    timeEnd: string;
    activity: string;
    icon: string;
    startHour: number;
    startMinute: number;
    endHour: number;
    endMinute: number;
    description?: string;
}

// Enhanced color palette for better dark mode
const getLightColors = () => ({
    primary: "#7C3AED",
    secondary: "#9333EA",
    calm: "#4F46E5",
    success: "#059669",
    warning: "#D97706",
    background: "#FAFAFA",
    surface: "#FFFFFF",
    surfaceHover: "#F9FAFB",
    text: "#1F2937",
    textLight: "#6B7280",
    textMuted: "#9CA3AF",
    border: "#E5E7EB",
    cardShadow: "rgba(0, 0, 0, 0.05)",
    accent1: "#F0FDFA",
    accent2: "#FDF2F8",
    accent3: "#EFF6FF",
    modalOverlay: "rgba(0, 0, 0, 0.5)",
    iconBackground: "#F0FDFA",
    gradientStart: "#7C3AED",
    gradientEnd: "#9333EA",
});

const getDarkColors = () => ({
    primary: "#A78BFA",
    secondary: "#C084FC",
    calm: "#818CF8",
    success: "#34D399",
    warning: "#FBBF24",
    background: "#111827",
    surface: "#1F2937",
    surfaceHover: "#374151",
    text: "#F9FAFB",
    textLight: "#E5E7EB",
    textMuted: "#9CA3AF",
    border: "#374151",
    cardShadow: "rgba(0, 0, 0, 0.3)",
    accent1: "#042F2E",
    accent2: "#831843",
    accent3: "#172554",
    modalOverlay: "rgba(0, 0, 0, 0.7)",
    iconBackground: "#374151",
    gradientStart: "#7C3AED",
    gradientEnd: "#C084FC",
});

interface Profile {
    name: string;
    age: number;
    role: string;
    batch: string;
    phone: string;
    emergencyContact: string;
    address: string;
    username: string;
    email: string;
    subjects?: string[];
    achievements?: string[];
    attendance?: number;
}

export default function SchoolDashboard() {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);
    const colorScheme = useColorScheme();
    const COLORS = colorScheme === "dark" ? getDarkColors() : getLightColors();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();
    

    const handleMessageTeacher = () => {
        navigation.navigate('message-teacher' as never);
    };

    const handleViewHomework = () => {
        navigation.navigate('view-homework' as never);
    };

    const handleLogout = () => {
        dispatch(logoutUser() as unknown as UnknownAction);
    };

    const [isProfileVisible, setIsProfileVisible] = useState(false);
    const [profile, setProfile] = useState<Profile>({
        name: user?.name || "N/A",
        age: user?.age || 0,
        role: user?.role || "N/A",
        batch: user?.batch || "N/A",
        phone: user?.phone || "N/A",
        emergencyContact: user?.emergencyContact || "N/A",
        address: user?.address || "N/A",
        username: user?.username || "N/A",
        email: user?.email || "N/A",
        subjects: ["Mathematics", "Science", "English", "History"],
        achievements: ["Perfect Attendance - Jan 2024", "Student of the Month - Dec 2023"],
        attendance: 95
    });

    const [currentTime, setCurrentTime] = useState(new Date());
    const [childProgress, setChildProgress] = useState<ChildProgress[]>([
        {
            id: "1",
            category: "Academic Progress",
            progress: 75,
            lastActivity: "Mathematics",
            mood: "focused",
            icon: "school"
        },
        {
            id: "2",
            category: "Social Interaction",
            progress: 60,
            lastActivity: "Group Prayer",
            mood: "calm",
            icon: "people"
        },
        {
            id: "3",
            category: "Daily Participation",
            progress: 85,
            lastActivity: "Exercise Session",
            mood: "happy",
            icon: "stars"
        },
    ]);

    const [schoolRoutines] = useState<SchoolRoutine[]>([
        {
            id: "1",
            timeStart: "9:00 AM",
            timeEnd: "9:30 AM",
            activity: "Prayer & Exercise",
            icon: "self-improvement",
            startHour: 9,
            startMinute: 0,
            endHour: 9,
            endMinute: 30,
            description: "Start your day with mindfulness and physical activity"
        },
        {
            id: "2",
            timeStart: "9:30 AM",
            timeEnd: "12:30 PM",
            activity: "Learning Session",
            icon: "school",
            startHour: 9,
            startMinute: 30,
            endHour: 12,
            endMinute: 30,
            description: "Core subjects and interactive learning"
        },
        {
            id: "3",
            timeStart: "12:30 PM",
            timeEnd: "1:30 PM",
            activity: "Lunch Break",
            icon: "restaurant",
            startHour: 12,
            startMinute: 30,
            endHour: 13,
            endMinute: 30,
            description: "Nutritious meal and social time"
        },
        {
            id: "4",
            timeStart: "1:30 PM",
            timeEnd: "2:30 PM",
            activity: "Homework Session",
            icon: "edit",
            startHour: 13,
            startMinute: 30,
            endHour: 14,
            endMinute: 30,
            description: "Guided study and homework completion"
        },
    ]);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        // Simulate data refresh
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);

    const AchievementBadge: React.FC<{ achievement: string }> = ({ achievement }) => (
        <ThemedView style={[styles.achievementBadge, { backgroundColor: COLORS.accent1 }]}>
            <MaterialIcons name="emoji-events" size={16} color={COLORS.primary} />
            <ThemedText style={[styles.achievementText, { color: COLORS.text }]}>
                {achievement}
            </ThemedText>
        </ThemedView>
    );

    const SubjectBadge: React.FC<{ subject: string }> = ({ subject }) => (
        <ThemedView style={[styles.subjectBadge, { backgroundColor: COLORS.accent3 }]}>
            <MaterialIcons name="book" size={16} color={COLORS.primary} />
            <ThemedText style={[styles.subjectText, { color: COLORS.text }]}>
                {subject}
            </ThemedText>
        </ThemedView>
    );

    const ProfileModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isProfileVisible}
            onRequestClose={() => setIsProfileVisible(false)}
        >
            <ThemedView
                style={[
                    styles.modalOverlay,
                    { backgroundColor: COLORS.modalOverlay },
                ]}
            >
                <ThemedView
                    style={[
                        styles.modalContent,
                        {
                            backgroundColor: COLORS.surface,
                            shadowColor: COLORS.cardShadow,
                        },
                    ]}
                >
                    <ThemedView style={styles.modalHeader}>
                        <TouchableOpacity
                            style={[
                                styles.closeButton,
                                { backgroundColor: COLORS.surfaceHover },
                            ]}
                            onPress={() => setIsProfileVisible(false)}
                        >
                            <MaterialIcons
                                name="close"
                                size={24}
                                color={COLORS.textLight}
                            />
                        </TouchableOpacity>
                    </ThemedView>

                    <ScrollView 
                        style={styles.profileContainer}
                        showsVerticalScrollIndicator={false}
                    >
                        <ThemedView style={styles.profileHeader}>
                            <Image
                                source={require("@/assets/images/profile.png")}
                                style={styles.profileImage}
                            />
                            <LinearGradient
                                colors={[COLORS.gradientStart, COLORS.gradientEnd]}
                                style={styles.editButton}
                            >
                                <MaterialIcons
                                    name="edit"
                                    size={20}
                                    color={COLORS.surface}
                                />
                            </LinearGradient>
                        </ThemedView>

                        <ThemedText
                            style={[styles.profileName, { color: COLORS.text }]}
                        >
                            {profile.name}
                        </ThemedText>
                        <ThemedText
                            style={[
                                styles.profileRole,
                                { color: COLORS.textLight },
                            ]}
                        >
                            {profile.role}
                        </ThemedText>

                        {/* Attendance Card */}
                        <ThemedView style={[styles.attendanceCard, { backgroundColor: COLORS.accent1 }]}>
                            <MaterialIcons name="timeline" size={24} color={COLORS.primary} />
                            <ThemedView style={styles.attendanceInfo}>
                                <ThemedText style={[styles.attendanceLabel, { color: COLORS.text }]}>
                                    Attendance Rate
                                </ThemedText>
                                <ThemedText style={[styles.attendanceValue, { color: COLORS.primary }]}>
                                    {profile.attendance}%
                                </ThemedText>
                            </ThemedView>
                        </ThemedView>

                        {/* Subjects Section */}
                        <ThemedView style={styles.sectionContainer}>
                            <ThemedText style={[styles.sectionTitle, { color: COLORS.text }]}>
                                Subjects
                            </ThemedText>
                            <ScrollView 
                                horizontal 
                                showsHorizontalScrollIndicator={false}
                                style={styles.badgesContainer}
                            >
                                {profile.subjects?.map((subject, index) => (
                                    <SubjectBadge key={index} subject={subject} />
                                ))}
                            </ScrollView>
                        </ThemedView>

                        {/* Achievements Section */}
                        <ThemedView style={styles.sectionContainer}>
                            <ThemedText style={[styles.sectionTitle, { color: COLORS.text }]}>
                                Recent Achievements
                            </ThemedText>
                            <ThemedView style={styles.achievementsContainer}>
                                {profile.achievements?.map((achievement, index) => (
                                    <AchievementBadge key={index} achievement={achievement} />
                                ))}
                            </ThemedView>
                        </ThemedView>

                        <ThemedView style={styles.basicInfoContainer}>
                        <ProfileInfoItem
                            icon="person-outline"  // Using valid MaterialIcons name
                            label="Username"
                            value={profile.username}
                        />
                        <ProfileInfoItem
                            icon="calendar-today"
                            label="Batch"
                            value={profile.batch}
                        />
                        <ProfileInfoItem
                            icon="person"
                            label="Age"
                            value={`${profile.age} years`}
                        />
                        <ProfileInfoItem
                            icon="phone"
                            label="Contact"
                            value={profile.phone}
                        />
                        <ProfileInfoItem
                            icon="location-on"
                            label="Address"
                            value={profile.address}
                        />
                        <ProfileInfoItem
                            icon="warning"  // Changed from "emergency" to a valid icon
                            label="Emergency Contact"
                            value={profile.emergencyContact}
                        />
                        <ProfileInfoItem
                            icon="email"
                            label="Email"
                            value={profile.email}
                        />
                    </ThemedView>

                        <TouchableOpacity
                            style={[
                                styles.logoutButton,
                                { backgroundColor: COLORS.accent2 },
                            ]}
                            onPress={handleLogout}
                        >
                            <MaterialIcons
                                name="logout"
                                size={20}
                                color={COLORS.warning}
                            />
                            <ThemedText
                                style={[
                                    styles.logoutText,
                                    { color: COLORS.warning },
                                ]}
                            >
                                Logout
                            </ThemedText>
                        </TouchableOpacity>
                    </ScrollView>
                </ThemedView>
            </ThemedView>
        </Modal>
    );

    const ProfileInfoItem: React.FC<{
        icon: keyof typeof MaterialIcons.glyphMap;  // This ensures icon name is valid
        label: string;
        value: string;
    }> = ({ icon, label, value }) => (
        <ThemedView
            style={[styles.infoItem, { borderBottomColor: COLORS.border }]}
        >
            <ThemedView
                style={[
                    styles.infoIcon,
                    { backgroundColor: COLORS.iconBackground },
                ]}
            >
                <MaterialIcons
                    name={icon}
                    size={20}
                    color={COLORS.primary}  // Fixed color prop
                />
            </ThemedView>
            <ThemedView style={styles.infoContent}>
                <ThemedText
                    style={[styles.infoLabel, { color: COLORS.textLight }]}
                >
                    {label}
                </ThemedText>
                <ThemedText style={[styles.infoValue, { color: COLORS.text }]}>
                    {value}
                </ThemedText>
            </ThemedView>
        </ThemedView>
    );
    
        useEffect(() => {
            const timer = setInterval(() => {
                setCurrentTime(new Date());
            }, 60000);
    
            return () => clearInterval(timer);
        }, []);
    
        const getActivityStatus = (routine: SchoolRoutine) => {
            const now = currentTime;
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
    
            const startTime = routine.startHour * 60 + routine.startMinute;
            const endTime = routine.endHour * 60 + routine.endMinute;
            const currentTimeInMinutes = currentHour * 60 + currentMinute;
    
            if (currentTimeInMinutes < startTime) {
                return "upcoming";
            } else if (
                currentTimeInMinutes >= startTime &&
                currentTimeInMinutes < endTime
            ) {
                return "inProgress";
            } else {
                return "completed";
            }
        };
    
        const fadeAnim = useRef(new Animated.Value(0)).current;
        const slideAnim = useRef(new Animated.Value(30)).current;
        const scaleAnim = useRef(new Animated.Value(0.95)).current;
    
        useEffect(() => {
            startAnimations();
            StatusBar.setBarStyle(colorScheme === "dark" ? "light-content" : "dark-content");
        }, [colorScheme]);
    
        const startAnimations = () => {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 20,
                    friction: 7,
                    useNativeDriver: true,
                }),
            ]).start();
        };
    
        const ProgressCard: React.FC<{ progress: ChildProgress }> = ({
            progress,
        }) => (
            <Animated.View
                style={[
                    styles.progressCard,
                    {
                        transform: [{ scale: scaleAnim }],
                        backgroundColor: COLORS.surface,
                    },
                ]}
            >
                <LinearGradient
                    colors={[COLORS.accent1, COLORS.accent3]}
                    style={styles.progressGradient}
                >
                    <ThemedView style={styles.progressHeader}>
                        <MaterialIcons
                            name={progress.icon}
                            size={24}
                            color={COLORS.primary}
                        />
                        <ThemedText style={[styles.progressTitle, { color: COLORS.text }]}>
                            {progress.category}
                        </ThemedText>
                    </ThemedView>
                    <ThemedView style={[styles.progressBar, { backgroundColor: COLORS.border }]}>
                        <Animated.View
                            style={[
                                styles.progressFill,
                                {
                                    width: `${progress.progress}%`,
                                    backgroundColor: COLORS.primary,
                                },
                            ]}
                        />
                    </ThemedView>
                    <ThemedText style={[styles.progressText, { color: COLORS.textLight }]}>
                        Current: {progress.lastActivity}
                    </ThemedText>
                    {progress.mood && (
                        <ThemedView style={styles.moodTag}>
                            <MaterialIcons
                                name={
                                    progress.mood === "focused"
                                        ? "psychology"
                                        : progress.mood === "calm"
                                        ? "spa"
                                        : "sentiment-very-satisfied"
                                }
                                size={16}
                                color={COLORS.primary}
                            />
                            <ThemedText style={[styles.moodText, { color: COLORS.textLight }]}>
                                {progress.mood}
                            </ThemedText>
                        </ThemedView>
                    )}
                </LinearGradient>
            </Animated.View>
        );
    
        const RoutineCard: React.FC<{ routine: SchoolRoutine }> = ({ routine }) => {
            const status = getActivityStatus(routine);
            return (
                <TouchableOpacity 
                    style={[
                        styles.routineCard,
                        { backgroundColor: COLORS.surface }
                    ]} 
                    activeOpacity={0.7}
                >
                    <ThemedView
                        style={[
                            styles.routineIcon,
                            {
                                backgroundColor:
                                    status === "completed"
                                        ? COLORS.accent1
                                        : status === "inProgress"
                                        ? COLORS.accent2
                                        : COLORS.accent3,
                            },
                        ]}
                    >
                        <MaterialIcons
                            name={routine.icon as any}
                            size={24}
                            color={COLORS.primary}
                        />
                    </ThemedView>
                    <ThemedView style={styles.routineInfo}>
                        <ThemedText style={[styles.routineTime, { color: COLORS.textLight }]}>
                            {routine.timeStart} - {routine.timeEnd}
                        </ThemedText>
                        <ThemedText style={[styles.routineActivity, { color: COLORS.text }]}>
                            {routine.activity}
                        </ThemedText>
                        {routine.description && (
                            <ThemedText style={[styles.routineDescription, { color: COLORS.textMuted }]}>
                                {routine.description}
                            </ThemedText>
                        )}
                    </ThemedView>
                    <MaterialIcons
                        name={
                            status === "completed"
                                ? "check-circle"
                                : status === "inProgress"
                                ? "pending"
                                : "schedule"
                        }
                        size={24}
                        color={
                            status === "completed"
                                ? COLORS.success
                                : status === "inProgress"
                                ? COLORS.warning
                                : COLORS.textLight
                        }
                    />
                </TouchableOpacity>
            );
        };
    
        return (
            <ScrollView
                style={[styles.container, { backgroundColor: COLORS.background }]}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={COLORS.primary}
                    />
                }
            >
                <ThemedView
                    style={[
                        styles.header,
                        {
                            backgroundColor: COLORS.surface,
                            shadowColor: COLORS.cardShadow,
                        },
                    ]}
                >
                    <ThemedView style={styles.headerContent}>
                        <ThemedView style={styles.headerTop}>
                            <TouchableOpacity
                                onPress={() => setIsProfileVisible(true)}
                            >
                                <Image
                                    source={require("@/assets/images/profile.png")}
                                    style={styles.childAvatar}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.helpButton, { backgroundColor: COLORS.accent1 }]}>
                                <MaterialIcons
                                    name="notifications"
                                    size={24}
                                    color={COLORS.primary}
                                />
                            </TouchableOpacity>
                        </ThemedView>
                        <ThemedText
                            style={[styles.welcomeText, { color: COLORS.text }]}
                        >
                            Hello, {profile.name}!
                        </ThemedText>
                        <ThemedText
                            style={[styles.subtitle, { color: COLORS.textLight }]}
                        >
                            Your School Day Overview
                        </ThemedText>
                    </ThemedView>
                </ThemedView>
    
                <ProfileModal />
    
                <ThemedView style={styles.content}>
                    <ThemedView style={styles.section}>
                        <ThemedText
                            style={[styles.sectionTitle, { color: COLORS.text }]}
                        >
                            Today's Progress
                        </ThemedText>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.progressContainer}
                        >
                            {childProgress.map((progress) => (
                                <ProgressCard
                                    key={progress.id}
                                    progress={progress}
                                />
                            ))}
                        </ScrollView>
                    </ThemedView>
    
                    <ThemedView style={styles.section}>
                        <ThemedView style={styles.sectionHeader}>
                            <ThemedText
                                style={[styles.sectionTitle, { color: COLORS.text }]}
                            >
                                School Schedule
                            </ThemedText>
                            <ThemedText
                                style={[styles.currentTime, { color: COLORS.primary }]}
                            >
                                {currentTime.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </ThemedText>
                        </ThemedView>
                        {schoolRoutines.map((routine) => (
                            <RoutineCard key={routine.id} routine={routine} />
                        ))}
                    </ThemedView>
    
                    <ThemedView style={styles.quickActions}>
                        <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={handleMessageTeacher}
                        >
                            <LinearGradient
                                colors={[COLORS.accent1, COLORS.accent3]}
                                style={styles.actionGradient}
                            >
                                <MaterialIcons
                                    name="message"
                                    size={24}
                                    color={COLORS.primary}
                                />
                                <ThemedText
                                    style={[styles.actionText, { color: COLORS.text }]}
                                >
                                    Message Teacher
                                </ThemedText>
                            </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={handleViewHomework}
                        >
                            <LinearGradient
                                colors={[COLORS.accent2, COLORS.accent1]}
                                style={styles.actionGradient}
                            >
                                <MaterialIcons
                                    name="assignment"
                                    size={24}
                                    color={COLORS.primary}
                                />
                                <ThemedText
                                    style={[styles.actionText, { color: COLORS.text }]}
                                >
                                    View Homework
                                </ThemedText>
                            </LinearGradient>
                        </TouchableOpacity>
                    </ThemedView>
    
                    <TouchableOpacity 
                        style={[styles.supportCard, { backgroundColor: COLORS.surface }]}
                        onPress={() => router.push('/support')}  // Use full path and type assertion
                        >
                        <ThemedView style={styles.supportContent}>
                            <MaterialIcons
                                name="help"
                                size={32}
                                color={COLORS.primary}
                            />
                            <ThemedView style={styles.supportText}>
                                <ThemedText
                                    style={[styles.supportTitle, { color: COLORS.text }]}
                                >
                                    Need Help?
                                </ThemedText>
                                <ThemedText
                                    style={[
                                        styles.supportSubtitle,
                                        { color: COLORS.textLight },
                                    ]}
                                >
                                    Contact school support
                                </ThemedText>
                            </ThemedView>
                        </ThemedView>
                        <MaterialIcons
                            name="arrow-forward-ios"
                            size={20}
                            color={COLORS.textLight}
                        />
                    </TouchableOpacity>
                </ThemedView>
            </ScrollView>
        );
    }
    
    const styles = StyleSheet.create({
        container: {
            flex: 1,
        },
        header: {
            paddingTop: Platform.OS === "ios" ? 60 : 40,
            paddingBottom: 20,
            borderBottomLeftRadius: 30,
            borderBottomRightRadius: 30,
            ...Platform.select({
                ios: {
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                },
                android: {
                    elevation: 4,
                },
            }),
        },
        headerContent: {
            paddingHorizontal: 20,
        },
        headerTop: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
        },
        childAvatar: {
            width: 50,
            height: 50,
            borderRadius: 25,
        },
        helpButton: {
            padding: 10,
            borderRadius: 12,
        },
        welcomeText: {
            fontSize: 28,
            fontWeight: "bold",
            marginBottom: 4,
        },
        subtitle: {
            fontSize: 16,
        },
        content: {
            padding: 20,
        },
        section: {
            marginBottom: 24,
        },
        sectionHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
        },
        sectionTitle: {
            fontSize: 20,
            fontWeight: "700",
            marginBottom: 16,
        },
        currentTime: {
            fontSize: 16,
            fontWeight: "600",
        },
        progressContainer: {
            paddingRight: 20,
        },
        progressCard: {
            width: width * 0.7,
            marginRight: 16,
            borderRadius: 16,
            overflow: "hidden",
            ...Platform.select({
                ios: {
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                },
                android: {
                    elevation: 2,
                },
            }),
        },
        progressGradient: {
            padding: 16,
        },
        progressHeader: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 12,
        },
        progressTitle: {
            fontSize: 16,
            fontWeight: "600",
            marginLeft: 8,
        },
        progressBar: {
            height: 8,
            borderRadius: 4,
            marginVertical: 8,
        },
        progressFill: {
            height: "100%",
            borderRadius: 4,
        },
        progressText: {
            fontSize: 14,
            marginTop: 8,
        },
        moodTag: {
            flexDirection: "row",
            alignItems: "center",
            marginTop: 8,
        },
        moodText: {
            fontSize: 14,
            marginLeft: 4,
            textTransform: "capitalize",
        },
        routineCard: {
            flexDirection: "row",
            alignItems: "center",
            padding: 16,
            borderRadius: 16,
            marginBottom: 12,
            ...Platform.select({
                ios: {
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                },
                android: {
                    elevation: 2,
                },
            }),
        },
        routineIcon: {
            width: 48,
            height: 48,
            borderRadius: 24,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 16,
        },
        routineInfo: {
            flex: 1,
        },
        routineTime: {
            fontSize: 14,
            marginBottom: 4,
        },
        routineActivity: {
            fontSize: 16,
            fontWeight: "600",
            marginBottom: 4,
        },
        routineDescription: {
            fontSize: 14,
        },
        quickActions: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 24,
        },
        actionButton: {
            flex: 1,
            marginHorizontal: 6,
        },
        actionGradient: {
            padding: 16,
            borderRadius: 16,
            alignItems: "center",
        },
        actionText: {
            fontSize: 14,
            fontWeight: "600",
            marginTop: 8,
        },
        supportCard: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 16,
            borderRadius: 16,
            marginBottom: 24,
            ...Platform.select({
                ios: {
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                },
                android: {
                    elevation: 2,
                },
            }),
        },
        supportContent: {
            flexDirection: "row",
            alignItems: "center",
        },
        supportText: {
            marginLeft: 16,
        },
        supportTitle: {
            fontSize: 18,
            fontWeight: "600",
            marginBottom: 4,
        },
        supportSubtitle: {
            fontSize: 14,
        },
        modalOverlay: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
        },
        modalContent: {
            width: "100%",
            maxHeight: "90%",
            borderRadius: 24,
            ...Platform.select({
                ios: {
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                },
                android: {
                    elevation: 4,
                },
            }),
        },
        modalHeader: {
            flexDirection: "row",
            justifyContent: "flex-end",
            padding: 16,
        },
        closeButton: {
            padding: 8,
            borderRadius: 20,
        },
        profileContainer: {
            padding: 20,
        },
        profileHeader: {
            alignItems: "center",
            marginBottom: 24,
        },
        profileImage: {
            width: 120,
            height: 120,
            borderRadius: 60,
            marginBottom: 16,
        },
        editButton: {
            position: "absolute",
            right: "30%",
            bottom: 12,
            width: 36,
            height: 36,
            borderRadius: 18,
            justifyContent: "center",
            alignItems: "center",
        },
        profileName: {
            fontSize: 24,
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 4,
        },
        profileRole: {
            fontSize: 16,
            textAlign: "center",
            marginBottom: 24,
        },
        attendanceCard: {
            flexDirection: "row",
            alignItems: "center",
            padding: 16,
            borderRadius: 16,
            marginBottom: 24,
        },
        attendanceInfo: {
            marginLeft: 16,
        },
        attendanceLabel: {
            fontSize: 14,
            marginBottom: 4,
        },
        attendanceValue: {
            fontSize: 24,
            fontWeight: "bold",
        },
        sectionContainer: {
            marginBottom: 24,
        },
        badgesContainer: {
            marginTop: 12,
        },
        achievementsContainer: {
            marginTop: 12,
        },
        subjectBadge: {
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
            marginRight: 8,
        },
        subjectText: {
            fontSize: 14,
            marginLeft: 6,
        },
        achievementBadge: {
            flexDirection: "row",
            alignItems: "center",
            padding: 12,
            borderRadius: 12,
            marginBottom: 8,
        },
        achievementText: {
            fontSize: 14,
            marginLeft: 8,
            flex: 1,
        },
        basicInfoContainer: {
            marginTop: 24,
        },
        infoItem: {
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 16,
            borderBottomWidth: 1,
        },
        infoIcon: {
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 16,
        },
        infoContent: {
            flex: 1,
        },
        infoLabel: {
            fontSize: 14,
            marginBottom: 4,
        },
        infoValue: {
            fontSize: 16,
        },
        logoutButton: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            borderRadius: 16,
            marginTop: 24,
            marginBottom: 40,
        },
        logoutText: {
            fontSize: 16,
            fontWeight: "600",
            marginLeft: 8,
        }
    });