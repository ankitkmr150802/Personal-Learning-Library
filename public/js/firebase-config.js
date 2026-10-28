// Import Firebase SDKs from reliable CDN URLs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBiiQHFegoav0zZFj_G4fyj246GGirK58c",
  authDomain: "mylearndeck.firebaseapp.com",
  projectId: "mylearndeck",
  storageBucket: "mylearndeck.firebasestorage.app",
  messagingSenderId: "559957123323",
  appId: "1:559957123323:web:390401ae4e38867115105e",
  measurementId: "G-54J4GDF9QB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);