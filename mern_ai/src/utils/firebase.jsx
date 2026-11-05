import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBdx9tDnY_Mvj4qrn0reagC5-BL6MyPCj4",
  authDomain: "mernai-a888a.firebaseapp.com",
  projectId: "mernai-a888a",
  storageBucket: "mernai-a888a.firebasestorage.app",
  messagingSenderId: "724267821616",
  appId: "1:724267821616:web:48bbc7e0909a8f4ec45bf5",
  measurementId: "G-K2PYP99EMR",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
