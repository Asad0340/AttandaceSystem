import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { db } from '../firebase'; // Make sure this path is correct
import { doc, onSnapshot, collection, updateDoc } from 'firebase/firestore';

const AdminPanelScreen = () => {
  const [users, setUsers] = useState({});
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [leaveRequests, setLeaveRequests] = useState({});
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch all users and set up real-time listeners
  const fetchUsers = () => {
    setLoading(true);
    const usersCollection = collection(db, 'users');
    const unsubscribeUsers = onSnapshot(usersCollection, (snapshot) => {
      const userList = snapshot.docs.reduce((acc, doc) => {
        const userData = { id: doc.id, ...doc.data() };
        acc[userData.id] = userData;
        return acc;
      }, {});

      setUsers(userList);

      // Clean up previous data
      setAttendanceRecords({});
      setLeaveRequests({});

      // Setup listeners for each user
      Object.keys(userList).forEach((userId) => {
        const attendanceCollection = collection(db, `users/${userId}/attendance`);
        const unsubscribeAttendance = onSnapshot(attendanceCollection, (snapshot) => {
          const attendanceData = snapshot.docs.reduce((acc, doc) => {
            acc[doc.id] = doc.data();
            return acc;
          }, {});
          setAttendanceRecords((prev) => ({
            ...prev,
            [userId]: attendanceData
          }));
        });

        const leaveRequestsCollection = collection(db, `users/${userId}/leaveRequests`);
        const unsubscribeLeaveRequests = onSnapshot(leaveRequestsCollection, (snapshot) => {
          const leaveRequestsData = snapshot.docs.reduce((acc, doc) => {
            acc[doc.id] = doc.data();
            return acc;
          }, {});
          setLeaveRequests((prev) => ({
            ...prev,
            [userId]: leaveRequestsData
          }));
        });

        // Cleanup listeners when the component unmounts or user list changes
        return () => {
          unsubscribeAttendance();
          unsubscribeLeaveRequests();
        };
      });

      setLoading(false);
    }, (error) => {
      console.error('Error fetching users and subcollections:', error);
      setLoading(false);
    });

    return () => unsubscribeUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Approve/Reject leave requests
  const handleLeaveApproval = async (userId, leaveId, status) => {
    try {
      const leaveDoc = doc(db, 'users', userId, 'leaveRequests', leaveId);
      await updateDoc(leaveDoc, { status });
      Alert.alert('Success', `Leave ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      console.error('Error approving leave:', error);
    }
  };

  // Edit attendance
  const editAttendance = async (userId, attendanceId) => {
    Alert.prompt(
      "Edit Attendance",
      "Enter new attendance status (e.g., Present, Absent):",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Submit",
          onPress: async (newStatus) => {
            if (!newStatus) {
              Alert.alert("Error", "Attendance status cannot be empty");
              return;
            }
            try {
              const attendanceDoc = doc(db, 'users', userId, 'attendance', attendanceId);
              await updateDoc(attendanceDoc, { status: newStatus });
              Alert.alert('Success', 'Attendance updated successfully');
            } catch (error) {
              console.error('Error updating attendance:', error);
              Alert.alert('Error', 'Failed to update attendance');
            }
          },
        },
      ],
      "plain-text"
    );
  };

  // Generate reports for all dates or specific user
  const generateReport = (userId) => {
    try {
      let recordsToDisplay = [];
      if (userId) {
        const userRecords = attendanceRecords[userId];
        if (userRecords) {
          recordsToDisplay = [{ userId, attendance: Object.values(userRecords) }];
        } else {
          Alert.alert('No Records', 'No attendance records found for the selected user.');
          return;
        }
      } else {
        recordsToDisplay = Object.keys(attendanceRecords).map(userId => ({
          userId,
          attendance: Object.values(attendanceRecords[userId])
        }));
      }

      const updatedRecords = recordsToDisplay.map(record => {
        const attendanceCount = record.attendance.length;
        const grade = calculateGrade(attendanceCount);
        return {
          ...record,
          grade
        };
      });

      setFilteredRecords(updatedRecords);
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  // Calculate grade based on attendance count
  const calculateGrade = (attendanceCount) => {
    if (attendanceCount >= 20) return 'A';
    if (attendanceCount >= 15) return 'B';
    if (attendanceCount >= 10) return 'C';
    if (attendanceCount >= 5) return 'D';
    return 'F';
  };

  // Combine users and report data into a single list with unique keys
  const data = [
    ...Object.keys(users).map(userId => ({
      id: `user-${userId}`,  // Unique key for user
      type: 'user',
      data: users[userId],
    })),
    ...filteredRecords.map(record => ({
      id: `report-${record.userId}`,  // Unique key for report
      type: 'report',
      data: record,
    }))
  ];

  const renderItem = ({ item }) => {
    if (item.type === 'user') {
      return (
        <View style={styles.userCard}>
          <Text style={styles.userEmail}>Email: {item.data.email}</Text>

          {/* Display Attendance Records */}
          {Object.keys(attendanceRecords[item.data.id] || {}).map((attId) => {
            const att = attendanceRecords[item.data.id][attId];
            return (
              <View key={attId} style={styles.record}>
                <Text>Date: {att.date}</Text>
                <Text>Status: {att.status}</Text>
                <TouchableOpacity style={styles.button} onPress={() => editAttendance(item.data.id, attId)}>
                  <Text style={styles.buttonText}>Edit Attendance</Text>
                </TouchableOpacity>
              </View>
            );
          })}

          {/* Display Leave Requests */}
          {Object.keys(leaveRequests[item.data.id] || {}).map((leaveId) => {
            const leave = leaveRequests[item.data.id][leaveId];
            return (
              <View key={leaveId} style={styles.record}>
                <Text>Leave Reason: {leave.reason}</Text>
                <Text>Status: {leave.status}</Text>
                <TouchableOpacity style={styles.button} onPress={() => handleLeaveApproval(item.data.id, leaveId, 'approved')}>
                  <Text style={styles.buttonText}>Approve Leave</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.rejectButton]} onPress={() => handleLeaveApproval(item.data.id, leaveId, 'rejected')}>
                  <Text style={styles.buttonText}>Reject Leave</Text>
                </TouchableOpacity>
              </View>
            );
          })}

          {/* Report Generation */}
          <TouchableOpacity style={styles.button} onPress={() => generateReport(item.data.id)}>
            <Text style={styles.buttonText}>Generate Report</Text>
          </TouchableOpacity>
        </View>
      );
    } else if (item.type === 'report') {
      return (
        <View style={styles.reportContainer}>
          <Text style={styles.reportTitle}>
            {`Attendance Report for User: ${item.data.userId}`}
          </Text>
          <Text style={styles.reportText}>Grade: {item.data.grade}</Text>
          {item.data.attendance.map((att) => (
            <View key={att.id}>
              <Text style={styles.reportText}>Date: {att.date}</Text>
              <Text style={styles.reportText}>Status: {att.status}</Text>
            </View>
          ))}
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0056b3" />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={() => (
            <TouchableOpacity style={styles.button} onPress={() => generateReport()}>
              <Text style={styles.buttonText}>Generate System-Wide Report</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f4f8',
  },
  userCard: {
    padding: 20,
    borderColor: '#e0e5e9',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  userEmail: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  record: {
    marginBottom: 15,
    padding: 10,
    borderColor: '#dfe1e6',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  rejectButton: {
    backgroundColor: '#dc3545',
  },
  reportContainer: {
    padding: 20,
    borderColor: '#e0e5e9',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  reportText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
});

export default AdminPanelScreen;
