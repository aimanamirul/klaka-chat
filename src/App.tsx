import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, addDoc, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

import { User } from "firebase/auth";

const firebaseConfig = {

  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASURE_ID
};

const fireApp = initializeApp(firebaseConfig);
const analytics = getAnalytics(fireApp);
const db = getFirestore(fireApp);
const auth = getAuth(fireApp);
const provider = new GoogleAuthProvider();

function App() {
  // const [count, setCount] = useState(0)

  // console.log(import.meta.env.VITE_TEST);

  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<{ d: string;[key: string]: any }[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (user) {
      const q = query(collection(db, "messages"),
        where("msg_sender", "==", user.uid),
        orderBy("timestamp"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setMessages(snapshot.docs.map(doc => ({ d: doc.id, ...doc.data() })));
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error("Error signing in", error);
    }
  };

  const handleSignOut = () => {
    signOut(auth);
    setUser(null);
  };

  return (
    <>
      <div className="p-4 max-w-md mx-auto bg-gray-100 rounded-xl shadow-md">
        {!user ? (
          <button onClick={handleSignIn} className="px-4 py-2 bg-blue-500 text-white rounded">
            Sign in with Google
          </button>
        ) : (
          <div>
            <button onClick={handleSignOut} className="px-4 py-2 bg-red-500 text-white rounded mb-4">
              Sign Out
            </button>
            <div className="h-64 overflow-y-auto bg-white p-2 mb-2">
              {messages.map(msg => (
                <div key={msg.id} className="p-2 border-b">
                  <strong>{msg.user}:</strong> {msg.text}
                </div>
              ))}
            </div>
            <div className="flex">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 p-2 border rounded"
                placeholder="Type a message..."
              />
              {/* <button onClick={handleSend} className="ml-2 px-4 py-2 bg-green-500 text-white rounded">
                Send
              </button> */}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default App
