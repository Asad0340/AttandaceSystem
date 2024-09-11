import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import MarkAttendanceScreen from './screens/MarkAttendanceScreen';
import AttendanceHistoryScreen from './screens/AttendanceHistoryScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import EditProfilePictureScreen from './screens/EditProfilePictureScreen';
import SendLeaveRequestScreen from './screens/SendLeaveRequestScreen';
import AdminPanelScreen from './screens/AdminPanelScreen';

const Stack = createStackNavigator();

function CustomHeader({ title, showBack, navigation }) {
  return (
    <LinearGradient
      colors={['#43C6AC', '#191654']} // Updated gradient colors
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.headerContainer}
    >
      <View style={styles.headerContent}>
        {/* Back Arrow Icon */}
        {showBack && navigation.canGoBack() && (
          <MaterialIcons
            name="arrow-back"
            size={28}
            color="white"
            onPress={() => navigation.goBack()}
            style={styles.backIcon} // Properly positioned back icon
          />
        )}
        {/* Title */}
        <Text style={styles.headerTitle}>{title}</Text>
        {/* Profile Icon Placeholder (optional) */}
        <MaterialIcons
          name="account-circle"
          size={28}
          color="white"
          style={styles.profileIcon}
        />
      </View>
    </LinearGradient>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: { backgroundColor: 'transparent' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          headerBackground: () => <View style={styles.headerBackground} />,
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={({ navigation }) => ({
            header: () => <CustomHeader title="Login" showBack={false} navigation={navigation} />,
          })}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={({ navigation }) => ({
            header: () => <CustomHeader title="Register" showBack={true} navigation={navigation} />,
          })}
        />
        <Stack.Screen
          name="MarkAttendance"
          component={MarkAttendanceScreen}
          options={({ navigation }) => ({
            header: () => <CustomHeader title="Mark Attendance" showBack={true} navigation={navigation} />,
          })}
        />
        <Stack.Screen
          name="AttendanceHistory"
          component={AttendanceHistoryScreen}
          options={({ navigation }) => ({
            header: () => <CustomHeader title="Attendance History" showBack={true} navigation={navigation} />,
          })}
        />
        <Stack.Screen
          name="EditProfile"
          component={EditProfilePictureScreen}
          options={({ navigation }) => ({
            header: () => <CustomHeader title="Edit Profile" showBack={true} navigation={navigation} />,
          })}
        />
        <Stack.Screen
          name="SendLeave"
          component={SendLeaveRequestScreen}
          options={({ navigation }) => ({
            header: () => <CustomHeader title="Send Leave Request" showBack={true} navigation={navigation} />,
          })}
        />
        <Stack.Screen
          name="AdminPanel"
          component={AdminPanelScreen}
          options={({ navigation }) => ({
            header: () => <CustomHeader title="Admin Panel" showBack={true} navigation={navigation} />,
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    height: 80,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    justifyContent: 'center',
    backgroundColor: '#2193b0', // Set a background color for the header
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backIcon: {
    position: 'absolute',
    left: 10,
    top: 15, // Align the icon vertically within the header
  },
  headerTitle: {
    fontSize: 28, // Increased font size for a more prominent header
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  profileIcon: {
    position: 'absolute',
    right: 10,
    top: 15, // Align the profile icon vertically within the header
  },
});