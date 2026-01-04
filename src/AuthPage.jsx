import React, { useState } from 'react';
import { auth, db } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import './AuthPage.css';

const AuthPage = ({ initialMode = 'login' }) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Check if user is suspended
        const userDoc = await getDoc(doc(db, 'users', user.uid));

        if (userDoc.exists() && userDoc.data().status === 'suspended') {
          await auth.signOut();
          setMessage({
            type: 'error',
            text: 'This account has been suspended by the administrator.',
          });
          setLoading(false);
          return;
        }

        setMessage({
          type: 'success',
          text: 'Welcome back! Login successful.',
        });
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        const user = userCredential.user;
        const isAdmin = email.toLowerCase() === 'admin@gmail.com';

        await setDoc(doc(db, 'users', user.uid), {
          company: company || (isAdmin ? 'SYSTEM ADMIN' : ''),
          email: email,
          role: isAdmin ? 'admin' : 'subadmin',
          status: 'active',
          plan: isAdmin ? 'pro' : 'trial',
          credits: isAdmin ? 999999 : 10,
          joinedAt: new Date().toISOString(),
        });

        setMessage({
          type: 'success',
          text: 'Account created! You can now login.',
        });
        setIsLogin(true);
      }
    } catch (error) {
      let errorMsg = error.message;
      if (error.code === 'auth/email-already-in-use') {
        errorMsg = "This email is already registered. Please switch to Login.";
      }
      setMessage({
        type: 'error',
        text: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-box">
        <header>
          <h1>{isLogin ? 'Welcome Back' : 'Get Started'}</h1>
          <p>{isLogin ? 'Login to your account' : 'Create a new account'}</p>
        </header>

        {message.text && (
          <div className={`status-msg ${message.type}`}>
            {message.text}
          </div>
        )}

        <form
          onSubmit={handleAuth}
          className={`auth-form ${isLogin ? 'login' : 'signup'}`}
        >
          {!isLogin && (
            <div className="field">
              <label>Company Name</label>
              <input
                type="text"
                placeholder="Your Company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
              />
            </div>
          )}

          <div className="field">
            <label>Email</label>
            <input
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <footer>
          <p>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <button
              type="button"
              className="switch-btn"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default AuthPage;
