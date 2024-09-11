import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const MarkAttendanceScreen = ({ navigation }) => {
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('present');
  const [loading, setLoading] = useState(false);

  const handleMarkAttendance = async () => {
    if (!date) {
      Alert.alert('Error', 'Please provide the date.');
      return;
    }

    setLoading(true);

    try {
      const userId = auth.currentUser.uid;
      const attendanceRef = doc(db, 'users', userId, 'attendance', date);

      const docSnap = await getDoc(attendanceRef);
      if (docSnap.exists()) {
        Alert.alert('Info', 'Attendance for today is already marked.');
        return;
      }

      await setDoc(attendanceRef, { date, status });
      Alert.alert('Success', 'Attendance marked successfully.');
      setDate('');
      setStatus('present');
    } catch (error) {
      console.error('Error marking attendance:', error);
      Alert.alert('Failed', 'Error marking attendance.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#43C6AC', '#191654']} style={styles.gradient}>
        <View style={styles.card}>
          <Text style={styles.title}>Mark Attendance</Text>

          <TextInput
            style={styles.input}
            placeholder="Date (YYYY-MM-DD)"
            value={date}
            onChangeText={setDate}
            placeholderTextColor="#bbb"
          />
          <TextInput
            style={styles.input}
            placeholder="Status (e.g., present)"
            value={status}
            onChangeText={setStatus}
            placeholderTextColor="#bbb"
          />

          <TouchableOpacity style={styles.button} onPress={handleMarkAttendance}>
            <Text style={styles.buttonText}>Mark Attendance</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.navButton]} onPress={() => navigation.navigate('AttendanceHistory')}>
            <Text style={styles.buttonText}>View History</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.navButton]} onPress={() => navigation.navigate('EditProfile')}>
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.navButton]} onPress={() => navigation.navigate('SendLeave')}>
            <Text style={styles.buttonText}>Send Leave Request</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {loading && (
        <Modal visible={loading} transparent={true}>
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    // Add a subtle border to the card
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#2193b0',
    paddingVertical: 12,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  navButton: {
    backgroundColor: '#6dd5ed',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
});

export default MarkAttendanceScreen;