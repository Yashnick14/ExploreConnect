// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCafVBeR5oJJDl_Ea2l2L-0Gy23ZMrOnbY",
  authDomain: "exploreconnect-f5a02.firebaseapp.com",
  projectId: "exploreconnect-f5a02",
  storageBucket: "exploreconnect-f5a02.firebasestorage.app",
  messagingSenderId: "134485346214",
  appId: "1:134485346214:web:5ac85e3d6a87d915f7f167"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;