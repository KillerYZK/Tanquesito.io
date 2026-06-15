import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAVQuM_YyNC1B2U9cFIG4pJrLXpG0DmPjw",
  authDomain: "tanquesitos-io.firebaseapp.com",
  databaseURL: "https://tanquesitos-io-default-rtdb.firebaseio.com", // confirmá esta URL en la consola
  projectId: "tanquesitos-io",
  storageBucket: "tanquesitos-io.firebasestorage.app",
  messagingSenderId: "52605056852",
  appId: "1:52605056852:web:d1112dfc09007b49d2bac1",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);