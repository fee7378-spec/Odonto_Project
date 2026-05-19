import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCboAXvvtfr6EcdfpmIcZo4qsNNGzK_-2o",
  authDomain: "fallon-project.firebaseapp.com",
  databaseURL: "https://fallon-project-default-rtdb.firebaseio.com",
  projectId: "fallon-project",
  storageBucket: "fallon-project.firebasestorage.app",
  messagingSenderId: "779367152908",
  appId: "1:779367152908:web:0bd55518d817db4be2dd29",
  measurementId: "G-56QYVPWWLZ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const firestore = getFirestore(app);
