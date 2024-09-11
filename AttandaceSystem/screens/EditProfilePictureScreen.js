import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getStorage } from 'firebase/storage';
import { auth } from '../firebase'; // Ensure you import auth from your firebase setup
import { updateProfile } from 'firebase/auth';
import { LinearGradient } from 'expo-linear-gradient';

const EditProfilePictureScreen = () => {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      }
    };

    requestPermissions();
    
    // Fetch profile picture on component mount
    const fetchProfilePicture = async () => {
      const user = auth.currentUser;
      if (user && user.photoURL) {
        setProfilePicture(user.photoURL);
      }
    };
    
    fetchProfilePicture();
  }, []);

  const handleImagePick = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const { uri } = result.assets[0];
      setImage(uri);
    } else {
      Alert.alert('No Image Selected', 'Please select an image to upload.');
    }
  };

  const handleUpload = async () => {
    if (!image) {
      Alert.alert('No Image Selected', 'Please select an image to upload.');
      return;
    }

    setUploading(true);

    try {
      const user = auth.currentUser;
      const storage = getStorage();
      const storageRef = ref(storage, `profilePictures/${user.uid}`);
      const response = await fetch(image);
      const blob = await response.blob();

      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      await updateProfile(user, { photoURL: downloadURL });

      setProfilePicture(downloadURL);

      Alert.alert('Success', 'Profile picture updated.');
    } catch (error) {
      console.error('Error uploading image: ', error);
      Alert.alert('Upload Failed', 'Failed to upload profile picture.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#e0f7fa', '#b2ebf2']}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Edit Profile Picture</Text>
        {profilePicture && (
          <Image source={{ uri: profilePicture }} style={styles.image} />
        )}
        <TouchableOpacity
          style={[styles.button, styles.pickButton]}
          onPress={handleImagePick}
        >
          <Text style={styles.buttonText}>Pick an Image</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.uploadButton]}
          onPress={handleUpload}
          disabled={uploading}
        >
          <Text style={styles.buttonText}>{uploading ? 'Uploading...' : 'Upload Image'}</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    width: '90%',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    elevation: 5, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 20,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: '#007bff',
    marginBottom: 20,
    backgroundColor: '#e0e0e0',
  },
  button: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 5,
  },
  pickButton: {
    backgroundColor: '#007bff',
  },
  uploadButton: {
    backgroundColor: '#28a745',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditProfilePictureScreen;
