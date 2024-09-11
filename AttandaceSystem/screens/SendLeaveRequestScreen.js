import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const SendLeaveRequestScreen = () => {
  const [reason, setReason] = useState('');
  const [date, setDate] = useState('');

  const handleSendRequest = async () => {
    if (!reason || !date) {
      Alert.alert('Error', 'Please provide all details.');
      return;
    }

    try {
      const userId = auth.currentUser.uid;
      const leaveRequestRef = doc(db, 'users', userId, 'leaveRequests', date); // Using date as the document ID

      await setDoc(leaveRequestRef, {
        reason,
        date,
        status: 'pending', // Default status
      });
      Alert.alert('Success', 'Leave request sent.');
      setReason('');
      setDate('');
    } catch (error) {
      console.error('Error sending leave request:', error);
      Alert.alert('Failed', 'Error sending leave request.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Send Leave Request</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Reason"
          value={reason}
          onChangeText={setReason}
        />
        <TextInput
          style={styles.input}
          placeholder="Date (YYYY-MM-DD)"
          value={date}
          onChangeText={setDate}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSendRequest}>
        <Text style={styles.buttonText}>Send Request</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#343a40',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: '#ced4da',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    fontSize: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SendLeaveRequestScreen;
