import React from 'react';
import { Menu, ArrowRight, Bot } from 'lucide-react';
import './LandingPage.css';

const LandingPage = ({ onGetStarted, onLogin }) => {
    return (
        <div className="landing-container">
            <header className="landing-header">
                <div className="logo-section">
                    <div className="logo-icon">
                        <Bot size={24} color="white" />
                    </div>
                    <span className="logo-text">AutoConnect</span>
                </div>
                <button className="menu-btn">
                    <Menu size={24} />
                </button>
            </header>

            <main className="landing-main">
                <div className="hero-section">
                    <div className="hero-visual">
                        <div className="glow-circle"></div>
                        <div className="glow-circle secondary"></div>
                        <div className="visual-grid"></div>
                    </div>

                    <div className="hero-content">
                        <div className="ai-badge">
                            <span className="badge-icon">⚡</span>
                            <span className="badge-text">AI POWERED</span>
                        </div>

                        <h1 className="hero-title">
                            Automate calls <br />
                            <span className="text-blue">with us</span>
                        </h1>

                        <p className="hero-subtitle">
                            Real-life lead conversion working 24/7 for your business growth.
                        </p>

                        <button className="get-started-btn" onClick={onGetStarted}>
                            Get Started <ArrowRight size={20} />
                        </button>

                        <div className="auth-footer">
                            <span>Already have an account? </span>
                            <button className="login-link" onClick={onLogin}>Log In</button>
                        </div>
                    </div>
                </div>
            </main>

            <div className="bottom-indicator"></div>
        </div>
    );
};

export default LandingPage;
