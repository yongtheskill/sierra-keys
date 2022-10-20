// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: 'AIzaSyBSl2YBlcwUQYbnin0ec5SFCyQL4upE1QQ',
  authDomain: 'sierra-keys.firebaseapp.com',
  databaseURL: 'https://sierra-keys-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'sierra-keys',
  storageBucket: 'sierra-keys.appspot.com',
  messagingSenderId: '982578257573',
  appId: '1:982578257573:web:4c2a2d55b03eba69d4f74c',
  measurementId: 'G-7GZY6PB89W',
};

// Initialize Firebase
const fapp = initializeApp(firebaseConfig);
const analytics = getAnalytics(fapp);
const auth = getAuth(fapp);
const db = getFirestore(fapp);
const functions = getFunctions(fapp);

//vue
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import './assets/main.css';

const app = createApp(App);
app.use(router);
app.mount('#app');
