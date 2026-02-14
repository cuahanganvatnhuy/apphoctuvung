// src/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyD8x9Bliw-1Iet8X0IhZkz7amObITIKsuE",
  authDomain: "db-vocabulary.firebaseapp.com",
  databaseURL: "https://db-vocabulary-default-rtdb.firebaseio.com",
  projectId: "db-vocabulary",
  storageBucket: "db-vocabulary.firebasestorage.app",
  messagingSenderId: "928192768700",
  appId: "1:928192768700:web:e638517714bf657448feb9",
  measurementId: "G-VBPLXCETVS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
export default app;