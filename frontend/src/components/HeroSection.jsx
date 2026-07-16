import React from 'react';

/**
 * HeroSection
 * Headline, subtitle and quick-stats strip shown above the form.
 */
const HeroSection = () => (
    <div className="hero-section">
        <h1 className="hero-title">
            Hệ thống Dự báo<br />
            <span className="hero-accent">Nguy cơ Tim mạch</span>
        </h1>
        <p className="hero-subtitle">
            Phân tích dữ liệu sinh học bằng thuật toán XGBoost với độ chính xác 95%
        </p>
        <div className="hero-stats">
            <div className="stat-item">
                <span className="stat-value">95%</span>
                <span className="stat-label">Độ chính xác</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
                <span className="stat-value">12</span>
                <span className="stat-label">Chỉ số phân tích</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
                <span className="stat-value">XGBoost</span>
                <span className="stat-label">Thuật toán</span>
            </div>
        </div>
    </div>
);

export default HeroSection;
