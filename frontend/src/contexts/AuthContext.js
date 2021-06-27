import React, { useState, useContext, useEffect } from 'react';
import { auth } from '../firebase';
import 'dotenv';
const AuthContext = React.createContext();
// The contexts and the providers are for creating data that can be
// shared through the rest of the components
export function useAuth() {
  return useContext(AuthContext);
}
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState();
  // This is important.
  // loading is set to false when the user state changes, but DONT actually
  // render until the loading is done!
  const [loading, setLoading] = useState(true);

  function signup(email, password) {
    return auth.createUserWithEmailAndPassword(email, password);
  }
  function login(email, password) {
    return auth.signInWithEmailAndPassword(email, password);
  }
  function logout() {
    return auth.signOut();
  }
  function resetPassword(email) {
    return auth.sendPasswordResetEmail(email);
  }

  // This is done in useEffect so its done once only, not each render.
  // only when component is mounted.
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user); // set user first, THEN
      setLoading(false); // set state to render
    });
    // unsubscribe from listener when the component is unmounted.
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    resetPassword,
  };
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
