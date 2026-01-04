import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { Menu, X } from 'lucide-react';
import { auth } from './firebase';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import LeadGeneration from './components/LeadGeneration';
import CampaignManager from './components/CampaignManager';
import './styles/SubAdminDashboard.css';

function SubAdminDashboard({ user, userProfile }) {
    const [activeSection, setActiveSection] = useState('dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleLogout = React.useCallback(async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    }, []);

    useEffect(() => {
        if (!userProfile?.sessionTimeout || !userProfile?.sessionStartedAt || userProfile.role === 'admin') {
            setTimeLeft(null);
            return;
        }

        const interval = setInterval(() => {
            const start = new Date(userProfile.sessionStartedAt).getTime();
            const limit = userProfile.sessionTimeout * 60 * 1000;
            const now = new Date().getTime();
            const remaining = Math.max(0, limit - (now - start));

            if (remaining <= 0) {
                clearInterval(interval);
                signOut(auth).then(() => {
                    alert("Your session has expired. You have been logged out by the administrator.");
                    window.location.reload();
                });
            } else {
                setTimeLeft(remaining);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [userProfile]);

    const formatTime = (ms) => {
        const totalSecs = Math.floor(ms / 1000);
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSectionChange = (section) => {
        setActiveSection(section);
        if (isMobile) {
            setIsMobileMenuOpen(false);
        }
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const renderContent = () => {
        switch (activeSection) {
            case 'dashboard':
                return <Dashboard user={user} userProfile={userProfile} />;
            case 'leads':
                return <LeadGeneration user={user} userProfile={userProfile} />;
            case 'campaigns':
                return <CampaignManager user={user} userProfile={userProfile} />;
            default:
                return <Dashboard user={user} userProfile={userProfile} />;
        }
    };

    return (
        <div className="subadmin-dashboard">
            {/* Mobile Menu Button */}
            {isMobile && (
                <button
                    className="mobile-menu-btn"
                    onClick={toggleMobileMenu}
                    style={{
                        position: 'fixed',
                        top: '1rem',
                        left: '1rem',
                        zIndex: 1001,
                        background: '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            )}

            {/* Mobile Overlay */}
            {isMobile && isMobileMenuOpen && (
                <div
                    className="mobile-overlay active"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {timeLeft !== null && (
                <div style={{
                    position: 'fixed',
                    top: isMobile ? '1rem' : '1.5rem',
                    right: '1.5rem',
                    zIndex: 1000,
                    background: timeLeft < 60000 ? '#fee2e2' : '#eff6ff',
                    color: timeLeft < 60000 ? '#991b1b' : '#1e40af',
                    padding: '0.6rem 1rem',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    border: `1px solid ${timeLeft < 60000 ? '#fecaca' : '#dbeafe'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <span style={{ fontSize: '1.1rem' }}>⏱️</span>
                    Session Ends: {formatTime(timeLeft)}
                </div>
            )}

            <Sidebar
                activeSection={activeSection}
                onSectionChange={handleSectionChange}
                user={user}
                userProfile={userProfile}
                onLogout={handleLogout}
                isMobileOpen={isMobileMenuOpen}
                isMobile={isMobile}
            />
            <main className="main-content" style={{ paddingTop: isMobile ? '4rem' : '0' }}>
                {renderContent()}
            </main>
        </div>
    );
}

export default SubAdminDashboard;
