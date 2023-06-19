import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

console.log("init-firebase")
const firebaseConfig = {
  apiKey: "AIzaSyB5qbquC2X8E8Aal7iLjxb3nY8eT2iq2mU",
  authDomain: "vtuber-wiki.firebaseapp.com",
  projectId: "vtuber-wiki",
  storageBucket: "vtuber-wiki.appspot.com",
  messagingSenderId: "932906415267",
  appId: "1:932906415267:web:e1abe68664eabc3c0d3b16",
  measurementId: "G-321VT76R3L"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);