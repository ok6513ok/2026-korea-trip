// firebase-init.js — Firebase Firestore initialization (ES module)
// Loaded as <script type="module"> before the Babel/React script.
// Exposes window.FirebaseSync so the React app can read/write Firestore.

import { initializeApp }   from 'https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js';
import { getFirestore, doc, setDoc, onSnapshot }
  from 'https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey:            'AIzaSyBnqLots0Tcxy649r1AiNJ4FwwBAUhPCEk',
  authDomain:        'korea-trip-e43da.firebaseapp.com',
  projectId:         'korea-trip-e43da',
  storageBucket:     'korea-trip-e43da.firebasestorage.app',
  messagingSenderId: '77476756668',
  appId:             '1:77476756668:web:4a1c743dac9c08fe6224b9',
  measurementId:     'G-GLXYWCGNR0',
};

try {
  const app        = initializeApp(firebaseConfig);
  const db         = getFirestore(app);
  const TRIP_ID    = '2026-korea-family-trip';
  const getTripRef = () => doc(db, 'trips', TRIP_ID);

  window.FirebaseSync = {
    ready:      true,
    tripId:     TRIP_ID,
    tripRef:    getTripRef,
    setDoc:     (ref, data, opts) => setDoc(ref, data, opts || {}),
    onSnapshot: (ref, cb, errCb) => onSnapshot(ref, cb, errCb),
  };

  window.dispatchEvent(new CustomEvent('firebase-ready'));
  console.info('[Firebase] 初始化成功，tripId:', TRIP_ID);
} catch (e) {
  console.warn('[Firebase] 初始化失敗，使用 localStorage 模式', e);
  // App will automatically fall back to localStorage
}
