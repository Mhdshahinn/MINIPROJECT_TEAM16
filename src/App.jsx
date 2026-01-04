import React, { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from './firebase'
import AuthPage from './AuthPage'
import SubAdminDashboard from './SubAdminDashboard'
import AdminDashboard from './AdminDashboard'
import PlansPage from './PlansPage'
import LandingPage from './LandingPage'
import './index.css'

function App() {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAuth, setShowAuth] = useState(false)
  const [initialAuthMode, setInitialAuthMode] = useState('login')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        try {
          const docRef = doc(db, 'users', currentUser.uid)
          const docSnap = await getDoc(docRef)
          if (docSnap.exists()) {
            setUserProfile(docSnap.data())
          }
        } catch (error) {
          console.error("Error fetching profile:", error)
        }
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: '#64748b' }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    if (showAuth) {
      return <AuthPage initialMode={initialAuthMode} />
    }
    return (
      <LandingPage
        onGetStarted={() => {
          setInitialAuthMode('signup')
          setShowAuth(true)
        }}
        onLogin={() => {
          setInitialAuthMode('login')
          setShowAuth(true)
        }}
      />
    )
  }

  // If user is disabled
  if (userProfile?.status === 'disabled') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', textAlign: 'center', padding: '2rem' }}>
        <h1 style={{ color: '#ef4444' }}>Account Disabled</h1>
        <p>Your account has been disabled by the administrator. Please contact support.</p>
        <button onClick={() => auth.signOut()} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px' }}>Logout</button>
      </div>
    )
  }

  // Admin routing
  if (userProfile?.role === 'admin' || user?.email?.toLowerCase() === 'admin@gmail.com') {
    return <AdminDashboard />
  }

  // SubAdmin routing
  if (userProfile?.role === 'subadmin' || userProfile?.company) {
    if (userProfile?.credits <= 0 && userProfile?.plan === 'trial') {
      return <PlansPage userProfile={userProfile} setUserProfile={setUserProfile} />
    }
    return <SubAdminDashboard user={user} userProfile={userProfile} />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', textAlign: 'center' }}>
      <h2>Security Check...</h2>
      <p>Authorized access for {user?.email}...</p>
      <button onClick={() => auth.signOut()} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>Log Out</button>
    </div>
  )
}

export default App
