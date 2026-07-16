import React from 'react';
import { Form, ConfigProvider, theme as antTheme } from 'antd';
import { UserOutlined, UploadOutlined } from '@ant-design/icons';

import usePrediction from './hooks/usePrediction';

import AppHeader      from './components/AppHeader';
import HeroSection    from './components/HeroSection';
import StepForm       from './components/StepForm';
import UploadPanel    from './components/UploadPanel';
import SingleResult   from './components/SingleResult';
import BatchResultPanel from './components/BatchResultPanel';
import HistorySidebar from './components/HistorySidebar';

import './HeartDiseasePredictor.css';

// ================================================================
// MAIN COMPONENT — layout only, ~80 lines
// ================================================================

const HeartDiseasePredictor = () => {
    const [form] = Form.useForm();

    const {
        // State
        loading, step, showResult, diagnosis,
        darkMode, activeTab,
        uploadFile, isDragging, setIsDragging,
        uploadLoading, uploadError, batchResult,
        history,

        // Handlers
        nextStep, prevStep,
        onFinish, resetForm,
        handleFileSelect, handleRemoveFile, handleUploadPredict, resetBatch,
        removeHistory, clearHistory,
        toggleDarkMode,
        switchToManual, switchToUpload,
    } = usePrediction(form);

    const showHero = !showResult && !batchResult;
    const showTabs = !showResult && !batchResult;

    return (
        <ConfigProvider
            theme={{ algorithm: darkMode ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm }}
        >
            <div className={`cardioai-root${darkMode ? ' dark-mode' : ''}`}>

                <AppHeader darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />

                <div className="cardioai-main">

                    {/* ── LEFT: Form / Result ── */}
                    <div className="main-left">
                        {showHero && <HeroSection />}

                        <div className="main-card">
                            {/* Tab Switcher */}
                            {showTabs && (
                                <div className="tab-switcher">
                                    <button
                                        className={`tab-btn ${activeTab === 'manual' ? 'active' : ''}`}
                                        onClick={switchToManual}
                                    >
                                        <UserOutlined /> Nhập tay
                                    </button>
                                    <button
                                        className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
                                        onClick={switchToUpload}
                                    >
                                        <UploadOutlined /> Upload CSV
                                    </button>
                                </div>
                            )}

                            {/* Manual form */}
                            {showTabs && activeTab === 'manual' && (
                                <StepForm
                                    form={form}
                                    step={step}
                                    loading={loading}
                                    onNext={nextStep}
                                    onPrev={prevStep}
                                    onFinish={onFinish}
                                />
                            )}

                            {/* Upload tab */}
                            {showTabs && activeTab === 'upload' && (
                                <UploadPanel
                                    uploadFile={uploadFile}
                                    isDragging={isDragging}
                                    setIsDragging={setIsDragging}
                                    uploadLoading={uploadLoading}
                                    uploadError={uploadError}
                                    onFileSelect={handleFileSelect}
                                    onRemoveFile={handleRemoveFile}
                                    onPredict={handleUploadPredict}
                                />
                            )}

                            {/* Single result */}
                            {showResult && diagnosis && (
                                <SingleResult
                                    diagnosis={diagnosis}
                                    darkMode={darkMode}
                                    onReset={resetForm}
                                />
                            )}

                            {/* Batch result */}
                            {batchResult && (
                                <BatchResultPanel
                                    batchResult={batchResult}
                                    darkMode={darkMode}
                                    onReset={resetBatch}
                                />
                            )}
                        </div>
                    </div>

                    {/* ── RIGHT: History sidebar ── */}
                    <HistorySidebar
                        history={history}
                        onRemove={removeHistory}
                        onClear={clearHistory}
                    />
                </div>

                <footer className="cardioai-footer">
                    CardioAI © 2026 &nbsp;·&nbsp; Đồ án Khai khoáng Dữ liệu
                    &nbsp;·&nbsp; XGBoost 95% accuracy
                    &nbsp;·&nbsp; Lịch sử được lưu cục bộ trên thiết bị của bạn
                </footer>
            </div>
        </ConfigProvider>
    );
};

export default HeartDiseasePredictor;