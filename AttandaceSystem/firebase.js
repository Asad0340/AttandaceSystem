// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration (from Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyCJJluGhYY5q6tZodvAAblrc1uFdbnbm48",
  authDomain: "attendancesystem-e506f.firebaseapp.com",
  projectId: "attendancesystem-e506f",
  storageBucket: "attendancesystem-e506f.appspot.com",
  messagingSenderId: "632939178308",
  appId: "1:632939178308:web:f4c0c2455ba5097fd8cf11",
  measurementId: "G-VFJ8V9HQEE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage for persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore (for database)
const db = getFirestore(app);

// Export services for use in other files
export { auth, db };
