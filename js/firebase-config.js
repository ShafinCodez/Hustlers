// Paste your Firebase project's configuration object here
const firebaseConfig = {
  apiKey: "AIzaSyA1JvyYCnmKhyo8PjEfu0WHI1-p1veD8fA",
  authDomain: "hustlers-website-eeb9b.firebaseapp.com",
  projectId: "hustlers-website-eeb9b",
  storageBucket: "hustlers-website-eeb9b.firebasestorage.app",
  messagingSenderId: "211026357737",
  appId: "1:211026357737:web:2cdbd50e16413383e6af78"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();