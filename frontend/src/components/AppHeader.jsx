import React from 'react';
import { HeartOutlined } from '@ant-design/icons';

/**
 * AppHeader
 * Top navigation bar: brand logo, AI status badge, dark-mode toggle.
 */
const AppHeader = ({ darkMode, onToggleDarkMode }) => (
    <header className="cardioai-header">
        <div className="header-brand">
            <div className="heart-icon-wrapper">
                <HeartOutlined className="heart-pulse-icon" />
            </div>
            <div>
                <span className="brand-name">CardioAI</span>
                <span className="brand-tagline">Medical Intelligence System</span>
            </div>
        </div>

        <div className="header-controls">
            <div className="status-badge">
                <span className="status-dot" />AI Core: Online
            </div>
            <button
                className="theme-toggle"
                onClick={onToggleDarkMode}
                title={darkMode ? 'Chuyển Light Mode' : 'Chuyển Dark Mode'}
            >
                {darkMode ? '☀️' : '🌙'}
            </button>
        </div>
    </header>
);

export default AppHeader;
