import { useState, useEffect } from 'react';
import { message } from 'antd';
import axios from 'axios';
import { FIELDS_BY_STEP } from '../constants/formConfig';

const API_BASE = 'http://localhost:5000/api';

/**
 * usePrediction
 *
 * Encapsulates all state and business logic for HeartDiseasePredictor.
 * Returns state values and handler functions; no JSX is produced here.
 *
 * @param {object} form  – Ant Design form instance (Form.useForm()[0])
 */
const usePrediction = (form) => {
    // ── UI state ──────────────────────────────────────────────────────────────
    const [loading, setLoading]         = useState(false);
    const [step, setStep]               = useState(0);
    const [showResult, setShowResult]   = useState(false);
    const [diagnosis, setDiagnosis]     = useState(null);
    const [darkMode, setDarkMode]       = useState(false);
    const [activeTab, setActiveTab]     = useState('manual'); // 'manual' | 'upload'

    // ── Upload state ──────────────────────────────────────────────────────────
    const [uploadFile, setUploadFile]       = useState(null);
    const [isDragging, setIsDragging]       = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [uploadError, setUploadError]     = useState(null);
    const [batchResult, setBatchResult]     = useState(null);

    // ── History (persisted to localStorage) ──────────────────────────────────
    const [history, setHistory] = useState(() => {
        try { return JSON.parse(localStorage.getItem('cardioai_history') || '[]'); }
        catch { return []; }
    });

    useEffect(() => {
        localStorage.setItem('cardioai_history', JSON.stringify(history));
    }, [history]);

    // ── Step navigation ───────────────────────────────────────────────────────
    const nextStep = async () => {
        try {
            await form.validateFields(FIELDS_BY_STEP[step]);
            setStep(s => s + 1);
        } catch { /* validation errors shown by Ant Design */ }
    };

    const prevStep = () => setStep(s => s - 1);

    // ── Single-patient prediction ─────────────────────────────────────────────
    const onFinish = async (values) => {
        setLoading(true);
        try {
            const res = await axios.post(`${API_BASE}/predict`, values);
            if (res.data.status === 'OK') {
                const { hasDisease, probability = 0 } = res.data.data;
                const confidence = parseFloat((probability * 100).toFixed(1));

                setDiagnosis({ hasDisease, confidence, values });
                setShowResult(true);

                const entry = {
                    id: Date.now(),
                    date: new Date().toLocaleDateString('vi-VN'),
                    time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                    hasDisease,
                    confidence,
                };
                setHistory(prev => [entry, ...prev].slice(0, 10));
            }
        } catch (err) {
            const detail = err.response?.data?.error_details || err.message;
            message.error(`Không thể kết nối AI Service: ${detail}`);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        form.resetFields();
        setStep(0);
        setShowResult(false);
        setDiagnosis(null);
    };

    // ── Upload / batch prediction ─────────────────────────────────────────────
    const handleFileSelect = (file) => {
        setUploadFile(file);
        setUploadError(null);
        setBatchResult(null);
    };

    const handleRemoveFile = () => {
        setUploadFile(null);
        setUploadError(null);
        setBatchResult(null);
    };

    const handleUploadPredict = async () => {
        if (!uploadFile) return;
        setUploadLoading(true);
        setUploadError(null);
        setBatchResult(null);

        try {
            const formData = new FormData();
            formData.append('file', uploadFile);

            const res = await axios.post(`${API_BASE}/predict/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (res.data.status === 'OK') {
                const d = res.data.data;
                setBatchResult({
                    total:                d.total_patients,
                    highRisk:             d.high_risk_count,
                    safe:                 d.safe_count,
                    results:              d.results,
                    columnMappingApplied: d.column_mapping_applied,
                });

                const entry = {
                    id:         Date.now(),
                    date:       new Date().toLocaleDateString('vi-VN'),
                    time:       new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                    hasDisease: d.high_risk_count > 0,
                    confidence: Math.round((d.high_risk_count / d.total_patients) * 100),
                    isBatch:    true,
                    batchCount: d.total_patients,
                };
                setHistory(prev => [entry, ...prev].slice(0, 10));
            }
        } catch (err) {
            const detail = err.response?.data?.error_details;
            setUploadError(detail || err.message);
        } finally {
            setUploadLoading(false);
        }
    };

    const resetBatch = () => {
        setBatchResult(null);
        setUploadFile(null);
        setUploadError(null);
        setActiveTab('upload');
    };

    // ── History management ────────────────────────────────────────────────────
    const removeHistory = (id) => setHistory(prev => prev.filter(i => i.id !== id));
    const clearHistory  = ()   => setHistory([]);

    // ── Dark mode toggle ──────────────────────────────────────────────────────
    const toggleDarkMode = () => setDarkMode(d => !d);

    // ── Tab switching (resets related state) ──────────────────────────────────
    const switchToManual = () => {
        setActiveTab('manual');
        setUploadError(null);
        setUploadFile(null);
    };

    const switchToUpload = () => {
        setActiveTab('upload');
        setShowResult(false);
    };

    return {
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
    };
};

export default usePrediction;
