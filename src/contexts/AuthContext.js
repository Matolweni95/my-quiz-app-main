import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { supabase } from '../supabase/supabaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from 'firebase/auth';
import CryptoJS from 'crypto-js';


const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY; 

 async function createSupabaseUser(firebaseUser, username = null) {
  if (!firebaseUser?.uid || !firebaseUser?.email) {
    throw new Error('Invalid Firebase user data');
  }

  try {
    // Encrypt Firebase UID and store it in localStorage
    const encryptedUID = CryptoJS.AES.encrypt(firebaseUser.uid, ENCRYPTION_KEY).toString();
    localStorage.setItem('firebase_uid', encryptedUID);

    // Check if the user already exists in Supabase
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('id', firebaseUser.uid)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (existingUser) {
      return existingUser;
    }

    // Insert new user into Supabase
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        id: firebaseUser.uid,
        email: firebaseUser.email,
        username: username || firebaseUser.email.split('@')[0],
        created_at: new Date(firebaseUser.metadata.creationTime).toISOString()
      });

    if (insertError) throw insertError;

    return newUser;

  } catch (error) {
    throw error;
  }
}

  
  

  async function signup(email, password, username = null) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const encryptedUID = CryptoJS.AES.encrypt(userCredential.user.uid, ENCRYPTION_KEY).toString();
      localStorage.setItem('firebase_uid', encryptedUID);
  
      await createSupabaseUser(userCredential.user, username);
      return userCredential;
    } catch (error) {
      if (auth.currentUser) {
        await auth.currentUser.delete();
      }
      throw error;
    }
  }
  

  async function loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const encryptedUID = CryptoJS.AES.encrypt(userCredential.user.uid, ENCRYPTION_KEY).toString();
      localStorage.setItem('firebase_uid', encryptedUID);
  
      await createSupabaseUser(userCredential.user);
      return userCredential;
    } catch (error) {
      throw error;
    }
  }
  

  async function login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const encryptedUID = CryptoJS.AES.encrypt(userCredential.user.uid, ENCRYPTION_KEY).toString();
      localStorage.setItem('firebase_uid', encryptedUID);
  
      return userCredential;
    } catch (error) {
      throw error;
    }
  }

  async function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          await createSupabaseUser(currentUser);
        } catch (error) {
          console.error('Error syncing user with Supabase:', error);
        }
      }
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    login,
    signup,
    logout,
    loginWithGoogle
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}