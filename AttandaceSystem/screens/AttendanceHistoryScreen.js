import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { collection, getDocs, query } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AttendanceHistoryScreen = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendanceAndLeaveRequests = async () => {
      try {
        const userId = auth.currentUser.uid;

        // Fetch attendance history
        const attendanceRef = collection(db, 'users', userId, 'attendance');
        const attendanceQuery = query(attendanceRef);
        const attendanceSnapshot = await getDocs(attendanceQuery);
        const attendanceList = attendanceSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        // Fetch leave requests
        const leaveRequestsRef = collection(db, 'users', userId, 'leaveRequests');
        const leaveRequestsQuery = query(leaveRequestsRef);
        const leaveRequestsSnapshot = await getDocs(leaveRequestsQuery);
        const leaveRequestsList = leaveRequestsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        setAttendanceData(attendanceList);
        setLeaveRequests(leaveRequestsList);
      } catch (err) {
        setError('Failed to load data.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceAndLeaveRequests();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading your records...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Attendance History</Text>
      <FlatList
        data={attendanceData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={styles.itemText}>{item.date}</Text>
            <Text style={styles.itemStatus}>{item.status}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No attendance records found.</Text>}
      />

      <Text style={styles.title}>Leave Request Status</Text>
      <FlatList
        data={leaveRequests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.leaveContainer}>
            <Text style={styles.leaveDate}>Date: {item.date}</Text>
            <Text style={styles.leaveReason}>Reason: {item.reason}</Text>
            <Text style={styles.leaveStatus}>Status: <Text style={item.status === 'approved' ? styles.approved : styles.pending}>{item.status}</Text></Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No leave requests found.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f6f9',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#3a3d42',
    marginBottom: 20,
  },
  itemContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemText: {
    fontSize: 16,
    color: '#333',
  },
  itemStatus: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
  },
  leaveContainer: {
    backgroundColor: '#fdfdfd',
    padding: 18,
    borderRadius: 10,
    marginBottom: 12,
    borderLeftWidth: 5,
    borderLeftColor: '#ffc107',
    elevation: 2,
  },
  leaveDate: {
    fontSize: 16,
    color: '#495057',
  },
  leaveReason: {
    fontSize: 14,
    color: '#6c757d',
    marginVertical: 5,
  },
  leaveStatus: {
    fontSize: 16,
    fontWeight: '500',
    color: '#495057',
  },
  approved: {
    color: '#28a745',
  },
  pending: {
    color: '#dc3545',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f6f9',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#007bff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f6f9',
  },
  errorText: {
    fontSize: 18,
    color: '#dc3545',
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default AttendanceHistoryScreen;
