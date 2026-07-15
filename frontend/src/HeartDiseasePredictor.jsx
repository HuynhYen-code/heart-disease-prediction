import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Form, InputNumber, Select, ConfigProvider, theme as antTheme,
    Space, Tooltip, message, Progress
} from 'antd';
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
    PieChart, Pie, Cell, Tooltip as ReTooltip, Legend
} from 'recharts';
import axios from 'axios';
import {
    HeartOutlined, UserOutlined, DashboardOutlined, FireOutlined,
    MedicineBoxOutlined, CheckCircleOutlined, ExclamationCircleOutlined,
    ArrowRightOutlined, ArrowLeftOutlined, ReloadOutlined, BulbOutlined,
    ClockCircleOutlined, DeleteOutlined, InfoCircleOutlined,
    UploadOutlined, FileTextOutlined, WarningOutlined, DownloadOutlined,
    TableOutlined, BarChartOutlined
} from '@ant-design/icons';
import './HeartDiseasePredictor.css';

const { Option } = Select;

// ================================================================
// CONSTANTS & PURE UTILITY FUNCTIONS
// ================================================================

const STEPS = [
    { title: 'Cơ bản', subtitle: 'Thông tin cơ thể', icon: <UserOutlined /> },
    { title: 'Lâm sàng', subtitle: 'Chỉ số xét nghiệm', icon: <DashboardOutlined /> },
    { title: 'Lối sống', subtitle: 'Hành vi & Di truyền', icon: <FireOutlined /> },
];

const FIELDS_BY_STEP = [
    ['age', 'gender', 'bmi', 'heart_rate'],
    ['glucose_mg_dl', 'cholesterol_mg_dl', 'systolic_bp', 'diastolic_bp'],
    ['smoking', 'alcohol_consumption', 'physical_activity', 'family_history'],
];

const COLUMN_LABELS = {
    age: 'Tuổi',
    gender: 'Giới tính',
    glucose_mg_dl: 'Đường huyết (mg/dL)',
    cholesterol_mg_dl: 'Cholesterol (mg/dL)',
    systolic_bp: 'Huyết áp tâm thu',
    diastolic_bp: 'Huyết áp tâm trương',
    bmi: 'BMI',
    heart_rate: 'Nhịp tim',
    smoking: 'Hút thuốc',
    alcohol_consumption: 'Rượu bia',
    physical_activity: 'Vận động',
    family_history: 'Tiền sử gia đình',
};

/** Chuẩn hoá 6 chỉ số cho radar chart (0-100) */
const getRadarData = (v) => {
    if (!v) return [];
    return [
        { metric: 'Glucose', value: Math.min(Math.round(((v.glucose_mg_dl || 0) / 180) * 100), 100), safe: 72 },
        { metric: 'Cholesterol', value: Math.min(Math.round(((v.cholesterol_mg_dl || 0) / 240) * 100), 100), safe: 72 },
        { metric: 'Huyết áp', value: Math.min(Math.round(((v.systolic_bp || 0) / 180) * 100), 100), safe: 67 },
        { metric: 'BMI', value: Math.min(Math.round(((v.bmi || 0) / 40) * 100), 100), safe: 63 },
        { metric: 'Nhịp tim', value: Math.min(Math.round(((v.heart_rate || 0) / 120) * 100), 100), safe: 67 },
        { metric: 'Tuổi', value: Math.min(Math.round(((v.age || 0) / 80) * 100), 100), safe: 75 },
    ];
};

// ================================================================
// SUB-COMPONENTS
// ================================================================

/** Radar chart 6 chỉ số */
const HealthRadar = ({ values, darkMode }) => {
    const data = getRadarData(values);
    const tickFill = darkMode ? '#94a3b8' : '#64748b';
    return (
        <ResponsiveContainer width="100%" height={210}>
            <RadarChart data={data} margin={{ top: 8, right: 18, bottom: 8, left: 18 }}>
                <PolarGrid stroke="rgba(148,163,184,0.18)" />
                <PolarAngleAxis dataKey="metric"
                    tick={{ fill: tickFill, fontSize: 11, fontFamily: 'Inter' }} />
                <Radar name="Ngưỡng tham chiếu" dataKey="safe"
                    stroke="#10b981" fill="#10b981" fillOpacity={0.07}
                    strokeWidth={2} strokeDasharray="4 2" />
                <Radar name="Bệnh nhân" dataKey="value"
                    stroke="#e11d48" fill="#e11d48" fillOpacity={0.22}
                    strokeWidth={2} dot={{ fill: '#e11d48', r: 3 }} />
            </RadarChart>
        </ResponsiveContainer>
    );
};

/** Một dòng lịch sử */
const HistoryItem = ({ item, index, onRemove }) => {
    const color = item.hasDisease ? '#ef4444' : '#10b981';
    return (
        <div className="history-item" style={{ animationDelay: `${index * 0.05}s` }}>
            <div className="history-item-left">
                <div className="history-dot" style={{ background: color }} />
                <div>
                    <div className="history-date">{item.date} · {item.time}</div>
                    <div className="history-status" style={{ color: color }}>
                        {item.hasDisease ? 'Phát hiện nguy cơ' : 'Chỉ số ổn định'}
                    </div>
                </div>
            </div>
            <div className="history-item-right">
                <div className="history-score" style={{ color }}>
                    {item.confidence}%<span style={{ fontSize: 10, fontWeight: 400 }}>tin cậy</span>
                </div>
                <button className="history-remove-btn" onClick={() => onRemove(item.id)}
                    title="Xóa mục này">×</button>
            </div>
        </div>
    );
};

// ── Batch Result Table ──────────────────────────────────────────────────────
const BatchResultTable = ({ results, originalFilename }) => {
    const [filter, setFilter] = useState('all'); // 'all' | 'risk' | 'safe'
    const [sortDesc, setSortDesc] = useState(true);

    const filtered = results
        .filter(r => filter === 'all' ? true : filter === 'risk' ? r.has_disease : !r.has_disease)
        .sort((a, b) => sortDesc ? b.probability - a.probability : a.probability - b.probability);

    const exportCSV = () => {
        const header = 'row_index,has_disease,probability_percent\n';
        const rows = results.map(r =>
            `${r.row_index},${r.has_disease ? 'Yes' : 'No'},${r.probability}`
        ).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cardioai_results_${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="batch-table-wrapper">
            <div className="batch-table-toolbar">
                <div className="batch-filter-tabs">
                    <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                        Tất cả ({results.length})
                    </button>
                    <button className={`filter-tab risk ${filter === 'risk' ? 'active' : ''}`} onClick={() => setFilter('risk')}>
                        ⚠ Nguy cơ cao ({results.filter(r => r.has_disease).length})
                    </button>
                    <button className={`filter-tab safe ${filter === 'safe' ? 'active' : ''}`} onClick={() => setFilter('safe')}>
                        ✓ An toàn ({results.filter(r => !r.has_disease).length})
                    </button>
                </div>
                <button className="btn-export" onClick={exportCSV}>
                    <DownloadOutlined /> Tải về CSV
                </button>
            </div>

            <div className="batch-table-scroll">
                <table className="batch-table">
                    <thead>
                        <tr>
                            <th>Bệnh nhân #</th>
                            <th>Kết quả</th>
                            <th onClick={() => setSortDesc(d => !d)} style={{ cursor: 'pointer' }}>
                                Xác suất % {sortDesc ? '↓' : '↑'}
                            </th>
                            <th>Thanh mức độ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(r => (
                            <tr key={r.row_index} className={r.has_disease ? 'row-risk' : 'row-safe'}>
                                <td className="td-index">#{r.row_index}</td>
                                <td>
                                    <span className={`result-badge ${r.has_disease ? 'danger' : 'safe'}`}>
                                        {r.has_disease ? '⚠ Nguy cơ cao' : '✓ An toàn'}
                                    </span>
                                </td>
                                <td className="td-prob">{r.probability}%</td>
                                <td className="td-bar">
                                    <div className="prob-bar-track">
                                        <div
                                            className={`prob-bar-fill ${r.has_disease ? 'danger' : 'safe'}`}
                                            style={{ width: `${r.probability}%` }}
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ── Batch Summary Donut ────────────────────────────────────────────────────────
const BatchSummaryChart = ({ highRisk, safe, darkMode }) => {
    const data = [
        { name: 'Nguy cơ cao', value: highRisk, color: '#e11d48' },
        { name: 'An toàn', value: safe, color: '#10b981' },
    ];
    return (
        <ResponsiveContainer width="100%" height={160}>
            <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                    dataKey="value" paddingAngle={3}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <ReTooltip formatter={(v, n) => [`${v} bệnh nhân`, n]} />
                <Legend iconType="circle" iconSize={10}
                    wrapperStyle={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b' }} />
            </PieChart>
        </ResponsiveContainer>
    );
};

// ── Drop Zone ──────────────────────────────────────────────────────────────────
const DropZone = ({ onFileSelect, isDragging, setIsDragging }) => {
    const inputRef = useRef(null);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) onFileSelect(file);
    }, [onFileSelect, setIsDragging]);

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => setIsDragging(false);

    return (
        <div
            className={`drop-zone ${isDragging ? 'dragging' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => inputRef.current?.click()}
        >
            <input ref={inputRef} type="file" accept=".csv" hidden
                onChange={e => { if (e.target.files[0]) onFileSelect(e.target.files[0]); }} />
            <div className="drop-zone-icon">
                <UploadOutlined />
            </div>
            <div className="drop-zone-text">
                <strong>Kéo thả file CSV vào đây</strong>
                <span>hoặc click để chọn file</span>
            </div>
            <div className="drop-zone-hint">
                Chấp nhận: .csv · Tối đa 1.000 bệnh nhân · 10 MB
            </div>
        </div>
    );
};

// ── Missing Value Error Panel ──────────────────────────────────────────────────
const MissingValuesError = ({ detail }) => {
    if (!detail) return null;

    if (detail.error_type === 'MISSING_COLUMNS') {
        return (
            <div className="upload-error-box column-error">
                <div className="error-title"><WarningOutlined /> Không nhận dạng được cột dữ liệu</div>
                <p>{detail.message}</p>
                <div className="error-cols-grid">
                    <div>
                        <strong>Cột còn thiếu:</strong>
                        <ul>{detail.missing_columns.map(c => <li key={c}><code>{c}</code> — {COLUMN_LABELS[c] || c}</li>)}</ul>
                    </div>
                    <div>
                        <strong>Cột phát hiện trong file:</strong>
                        <ul>{detail.detected_columns.map(c => <li key={c}><code>{c}</code></li>)}</ul>
                    </div>
                </div>
            </div>
        );
    }

    if (detail.error_type === 'MISSING_VALUES') {
        return (
            <div className="upload-error-box missing-error">
                <div className="error-title"><WarningOutlined /> Dữ liệu bị khuyết — Cần bổ sung trước khi dự đoán</div>
                <p>{detail.message}</p>
                <div className="missing-table-scroll">
                    <table className="missing-table">
                        <thead>
                            <tr><th>Tên cột</th><th>Ý nghĩa</th><th>Số ô thiếu</th><th>Hàng bị thiếu</th></tr>
                        </thead>
                        <tbody>
                            {detail.missing_details.map(m => (
                                <tr key={m.column}>
                                    <td><code>{m.column}</code></td>
                                    <td>{COLUMN_LABELS[m.column] || m.column}</td>
                                    <td className="td-count">{m.count}</td>
                                    <td className="td-rows">
                                        {m.missing_rows.slice(0, 10).join(', ')}
                                        {m.missing_rows.length > 10 ? ` ... (+${m.missing_rows.length - 10} hàng)` : ''}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="error-action-hint">
                    ↑ Vui lòng bổ sung đầy đủ các ô còn thiếu trong file CSV và upload lại.
                </div>
            </div>
        );
    }

    return (
        <div className="upload-error-box generic-error">
            <div className="error-title"><WarningOutlined /> Lỗi xử lý file</div>
            <p>{typeof detail === 'string' ? detail : JSON.stringify(detail)}</p>
        </div>
    );
};

// ================================================================
// MAIN COMPONENT
// ================================================================

const HeartDiseasePredictor = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [diagnosis, setDiagnosis] = useState(null);
    const [darkMode, setDarkMode] = useState(false);

    // Tab state: 'manual' | 'upload'
    const [activeTab, setActiveTab] = useState('manual');

    // Upload state
    const [uploadFile, setUploadFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [uploadError, setUploadError] = useState(null);  // { error_type, ... }
    const [batchResult, setBatchResult] = useState(null);   // { total, highRisk, safe, results[] }

    // Persist history to localStorage
    const [history, setHistory] = useState(() => {
        try { return JSON.parse(localStorage.getItem('cardioai_history') || '[]'); }
        catch { return []; }
    });
    useEffect(() => {
        localStorage.setItem('cardioai_history', JSON.stringify(history));
    }, [history]);

    const nextStep = async () => {
        try { await form.validateFields(FIELDS_BY_STEP[step]); setStep(s => s + 1); }
        catch { }
    };
    const prevStep = () => setStep(s => s - 1);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/predict', values);
            if (res.data.status === 'OK') {
                const hasDisease = res.data.data.hasDisease;
                const prob = res.data.data.probability || 0;
                const confidence = parseFloat((prob * 100).toFixed(1));

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

    // ── Upload handlers ──────────────────────────────────────────────────────
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

            const res = await axios.post('http://localhost:5000/api/predict/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (res.data.status === 'OK') {
                const d = res.data.data;
                setBatchResult({
                    total: d.total_patients,
                    highRisk: d.high_risk_count,
                    safe: d.safe_count,
                    results: d.results,
                    columnMappingApplied: d.column_mapping_applied,
                });
                // Thêm vào lịch sử
                const entry = {
                    id: Date.now(),
                    date: new Date().toLocaleDateString('vi-VN'),
                    time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                    hasDisease: d.high_risk_count > 0,
                    confidence: Math.round((d.high_risk_count / d.total_patients) * 100),
                    isBatch: true,
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

    const removeHistory = (id) => setHistory(prev => prev.filter(i => i.id !== id));
    const clearHistory = () => setHistory([]);

    // ── RENDER ──────────────────────────────────────────────────────────────
    return (
        <ConfigProvider theme={{ algorithm: darkMode ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm }}>
            <div className={`cardioai-root${darkMode ? ' dark-mode' : ''}`}>

                {/* ══ HEADER ══════════════════════════════════════════ */}
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
                        <button className="theme-toggle"
                            onClick={() => setDarkMode(d => !d)}
                            title={darkMode ? 'Chuyển Light Mode' : 'Chuyển Dark Mode'}>
                            {darkMode ? '☀️' : '🌙'}
                        </button>
                    </div>
                </header>

                {/* ══ MAIN GRID ════════════════════════════════════════ */}
                <div className="cardioai-main">

                    {/* ── LEFT: Form / Result ──────────────────────── */}
                    <div className="main-left">

                        {/* Hero */}
                        {!showResult && !batchResult && (
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
                        )}

                        {/* Main card */}
                        <div className="main-card">

                            {/* ─── TAB SWITCHER ─── */}
                            {!showResult && !batchResult && (
                                <div className="tab-switcher">
                                    <button
                                        className={`tab-btn ${activeTab === 'manual' ? 'active' : ''}`}
                                        onClick={() => { setActiveTab('manual'); setUploadError(null); setUploadFile(null); }}
                                    >
                                        <UserOutlined /> Nhập tay
                                    </button>
                                    <button
                                        className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
                                        onClick={() => { setActiveTab('upload'); setShowResult(false); }}
                                    >
                                        <UploadOutlined /> Upload CSV
                                    </button>
                                </div>
                            )}

                            {/* ─── MANUAL FORM ─── */}
                            {!showResult && !batchResult && activeTab === 'manual' && (
                                <>
                                    {/* Progress header */}
                                    <div className="form-header">
                                        <div className="step-progress">
                                            {STEPS.map((s, i) => (
                                                <div key={i} className={`step-item${i === step ? ' active' : i < step ? ' done' : ''}`}>
                                                    <div className="step-circle">
                                                        {i < step ? '✓' : i + 1}
                                                    </div>
                                                    <div className="step-info">
                                                        <div className="step-title">{s.title}</div>
                                                        <div className="step-subtitle">{s.subtitle}</div>
                                                    </div>
                                                    {i < STEPS.length - 1 && (
                                                        <div className={`step-connector${i < step ? ' done' : ''}`} />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
                                        {/* Step 1 */}
                                        <div className="form-step" style={{ display: step === 0 ? 'block' : 'none' }}>
                                            <div className="section-label"><UserOutlined /> Chỉ số cơ thể &amp; Nền tảng</div>
                                            <div className="form-grid">
                                                <Form.Item name="age" label="Tuổi bệnh nhân"
                                                    rules={[{ required: true, message: 'Vui lòng nhập tuổi' }]}>
                                                    <InputNumber style={{ width: '100%' }} min={18} max={120}
                                                        placeholder="18 – 120" size="large" />
                                                </Form.Item>
                                                <Form.Item name="gender" label="Giới tính"
                                                    rules={[{ required: true, message: 'Vui lòng chọn' }]}>
                                                    <Select placeholder="Chọn giới tính" size="large">
                                                        <Option value="Male">Nam</Option>
                                                        <Option value="Female">Nữ</Option>
                                                    </Select>
                                                </Form.Item>
                                                <Form.Item name="bmi"
                                                    label={<Space>Chỉ số khối BMI
                                                        <Tooltip title="BMI = Cân nặng (kg) / Chiều cao² (m). Bình thường: 18.5–24.9">
                                                            <InfoCircleOutlined style={{ color: '#94a3b8' }} />
                                                        </Tooltip>
                                                    </Space>}
                                                    rules={[{ required: true, message: 'Vui lòng nhập BMI' }]}>
                                                    <InputNumber style={{ width: '100%' }} min={10} max={60}
                                                        step={0.1} placeholder="10 – 60" size="large" />
                                                </Form.Item>
                                                <Form.Item name="heart_rate"
                                                    label={<Space>Nhịp tim nghỉ ngơi (BPM)
                                                        <Tooltip title="Bình thường khi nghỉ: 60–100 BPM">
                                                            <InfoCircleOutlined style={{ color: '#94a3b8' }} />
                                                        </Tooltip>
                                                    </Space>}
                                                    rules={[{ required: true, message: 'Vui lòng nhập nhịp tim' }]}>
                                                    <InputNumber style={{ width: '100%' }} min={30} max={200}
                                                        placeholder="60 – 100 BPM" size="large" />
                                                </Form.Item>
                                            </div>
                                        </div>

                                        {/* Step 2 */}
                                        <div className="form-step" style={{ display: step === 1 ? 'block' : 'none' }}>
                                            <div className="section-label"><DashboardOutlined /> Thông số Xét nghiệm</div>
                                            <div className="form-grid">
                                                <Form.Item name="glucose_mg_dl"
                                                    label={<Space>Đường huyết (mg/dL)
                                                        <Tooltip title="Lúc đói bình thường: 70–99. Tiền ĐTĐ: 100–125. ĐTĐ: ≥126">
                                                            <InfoCircleOutlined style={{ color: '#94a3b8' }} />
                                                        </Tooltip>
                                                    </Space>}
                                                    rules={[{ required: true, message: 'Vui lòng nhập' }]}>
                                                    <InputNumber style={{ width: '100%' }} min={40} max={500}
                                                        placeholder="70 – 99 mg/dL" size="large" />
                                                </Form.Item>
                                                <Form.Item name="cholesterol_mg_dl"
                                                    label={<Space>Cholesterol (mg/dL)
                                                        <Tooltip title="Tốt: <200. Ranh giới: 200–239. Cao: ≥240 mg/dL">
                                                            <InfoCircleOutlined style={{ color: '#94a3b8' }} />
                                                        </Tooltip>
                                                    </Space>}
                                                    rules={[{ required: true, message: 'Vui lòng nhập' }]}>
                                                    <InputNumber style={{ width: '100%' }} min={50} max={500}
                                                        placeholder="< 200 mg/dL" size="large" />
                                                </Form.Item>
                                                <Form.Item name="systolic_bp"
                                                    label={<Space>Huyết áp Tâm thu (mmHg)
                                                        <Tooltip title="Bình thường: <120. Tăng nhẹ: 120–129. Tăng cao: ≥130">
                                                            <InfoCircleOutlined style={{ color: '#94a3b8' }} />
                                                        </Tooltip>
                                                    </Space>}
                                                    rules={[{ required: true, message: 'Vui lòng nhập' }]}>
                                                    <InputNumber style={{ width: '100%' }} min={70} max={250}
                                                        placeholder="< 120 mmHg" size="large" />
                                                </Form.Item>
                                                <Form.Item name="diastolic_bp"
                                                    label={<Space>Huyết áp Tâm trương (mmHg)
                                                        <Tooltip title="Bình thường: <80. Tăng cao: ≥90 mmHg">
                                                            <InfoCircleOutlined style={{ color: '#94a3b8' }} />
                                                        </Tooltip>
                                                    </Space>}
                                                    rules={[{ required: true, message: 'Vui lòng nhập' }]}>
                                                    <InputNumber style={{ width: '100%' }} min={40} max={150}
                                                        placeholder="< 80 mmHg" size="large" />
                                                </Form.Item>
                                            </div>
                                        </div>

                                        {/* Step 3 */}
                                        <div className="form-step" style={{ display: step === 2 ? 'block' : 'none' }}>
                                            <div className="section-label"><FireOutlined /> Hành vi &amp; Di truyền</div>
                                            <div className="form-grid">
                                                <Form.Item name="smoking" label="Hút thuốc lá"
                                                    rules={[{ required: true, message: 'Vui lòng chọn' }]}>
                                                    <Select placeholder="Chọn trạng thái" size="large">
                                                        <Option value="Yes">Có hút thuốc</Option>
                                                        <Option value="No">Không hút</Option>
                                                    </Select>
                                                </Form.Item>
                                                <Form.Item name="alcohol_consumption" label="Sử dụng rượu bia"
                                                    rules={[{ required: true, message: 'Vui lòng chọn' }]}>
                                                    <Select placeholder="Chọn trạng thái" size="large">
                                                        <Option value="Yes">Có sử dụng</Option>
                                                        <Option value="No">Không sử dụng</Option>
                                                    </Select>
                                                </Form.Item>
                                                <Form.Item name="physical_activity" label="Mức độ vận động thể chất"
                                                    rules={[{ required: true, message: 'Vui lòng chọn' }]}>
                                                    <Select placeholder="Chọn mức độ" size="large">
                                                        <Option value="Low">Thấp (Ít vận động)</Option>
                                                        <Option value="Medium">Trung bình (2-3 ngày/tuần)</Option>
                                                        <Option value="High">Cao (4-5 ngày/tuần)</Option>
                                                    </Select>
                                                </Form.Item>
                                                <Form.Item name="family_history" label="Tiền sử bệnh tim trong gia đình"
                                                    rules={[{ required: true, message: 'Vui lòng chọn' }]}>
                                                    <Select placeholder="Chọn trạng thái" size="large">
                                                        <Option value="Yes">Có tiền sử bệnh</Option>
                                                        <Option value="No">Không có</Option>
                                                    </Select>
                                                </Form.Item>
                                            </div>
                                        </div>

                                        {/* Navigation */}
                                        <div className="form-nav">
                                            {step > 0
                                                ? <button type="button" className="btn btn-ghost" onClick={prevStep}>
                                                    <ArrowLeftOutlined /> Quay lại
                                                </button>
                                                : <div />}
                                            {step < 2
                                                ? <button type="button" className="btn btn-primary" onClick={nextStep}>
                                                    Tiếp tục <ArrowRightOutlined />
                                                </button>
                                                : <button type="submit" className="btn btn-danger" disabled={loading}>
                                                    {loading
                                                        ? <><span className="loading-spinner">⟳</span> Đang phân tích...</>
                                                        : <><HeartOutlined /> Phân tích AI ngay</>}
                                                </button>}
                                        </div>
                                    </Form>
                                </>
                            )}

                            {/* ─── UPLOAD TAB ─── */}
                            {!showResult && !batchResult && activeTab === 'upload' && (
                                <div className="upload-panel">
                                    <div className="upload-panel-header">
                                        <FileTextOutlined className="upload-panel-icon" />
                                        <div>
                                            <div className="upload-panel-title">Dự đoán hàng loạt qua CSV</div>
                                            <div className="upload-panel-sub">
                                                Upload file CSV chứa dữ liệu nhiều bệnh nhân. Hệ thống tự động nhận dạng tên cột.
                                            </div>
                                        </div>
                                    </div>

                                    {/* Required columns hint */}
                                    <div className="required-cols-hint">
                                        <strong>Các cột bắt buộc:</strong>
                                        <div className="cols-chips">
                                            {Object.entries(COLUMN_LABELS).map(([k, v]) => (
                                                <span key={k} className="col-chip"><code>{k}</code> ({v})</span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Drop Zone or File Preview */}
                                    {!uploadFile ? (
                                        <DropZone
                                            onFileSelect={handleFileSelect}
                                            isDragging={isDragging}
                                            setIsDragging={setIsDragging}
                                        />
                                    ) : (
                                        <div className="file-preview">
                                            <div className="file-preview-icon"><FileTextOutlined /></div>
                                            <div className="file-preview-info">
                                                <div className="file-name">{uploadFile.name}</div>
                                                <div className="file-size">
                                                    {(uploadFile.size / 1024).toFixed(1)} KB
                                                </div>
                                            </div>
                                            <button className="file-remove-btn" onClick={handleRemoveFile} title="Xóa file">×</button>
                                        </div>
                                    )}

                                    {/* Error Panel */}
                                    {uploadError && (
                                        <MissingValuesError detail={uploadError} />
                                    )}

                                    {/* Action Button */}
                                    <button
                                        className={`btn btn-upload-predict ${uploadLoading ? 'loading' : ''}`}
                                        onClick={handleUploadPredict}
                                        disabled={!uploadFile || uploadLoading}
                                    >
                                        {uploadLoading
                                            ? <><span className="loading-spinner">⟳</span> Đang phân tích dữ liệu...</>
                                            : <><BarChartOutlined /> Phân tích hàng loạt</>}
                                    </button>
                                </div>
                            )}

                            {/* ─── SINGLE RESULT ─── */}
                            {showResult && diagnosis && (
                                <div className="result-panel">
                                    <div className={`result-banner ${diagnosis.hasDisease ? 'danger' : 'safe'}`}>
                                        <div className="result-banner-icon">
                                            {diagnosis.hasDisease
                                                ? <ExclamationCircleOutlined />
                                                : <CheckCircleOutlined />}
                                        </div>
                                        <div>
                                            <h2 className="result-title">
                                                {diagnosis.hasDisease ? 'PHÁT HIỆN NGUY CƠ CAO' : 'CHỈ SỐ SINH HỌC ỔN ĐỊNH'}
                                            </h2>
                                            <p className="result-subtitle">
                                                {diagnosis.hasDisease
                                                    ? 'Mô hình thuật toán phát hiện các đặc trưng sinh học có khả năng bệnh lý.'
                                                    : 'Các chỉ số hiện tại nằm trong ngưỡng an toàn của mô hình.'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="charts-grid">
                                        <div className="chart-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                            <div className="chart-title" style={{ width: '100%', textAlign: 'left' }}>Độ tin cậy của AI (Confidence)</div>
                                            <div style={{ margin: '20px 0' }}>
                                                <Progress
                                                    type="dashboard"
                                                    percent={diagnosis.confidence}
                                                    strokeColor={diagnosis.hasDisease ? '#e11d48' : '#10b981'}
                                                    size={160}
                                                    format={percent => <span style={{ fontSize: '28px', color: diagnosis.hasDisease ? '#e11d48' : '#10b981' }}>{percent}%</span>}
                                                />
                                            </div>
                                            <div className="gauge-desc" style={{ color: '#64748b', fontSize: '13px', textAlign: 'center' }}>
                                                Dựa trên phân tích xác suất của mô hình XGBoost
                                            </div>
                                        </div>

                                        <div className="chart-card">
                                            <div className="chart-title">Phân tích đa chiều 6 chỉ số</div>
                                            <HealthRadar values={diagnosis.values} darkMode={darkMode} />
                                            <div className="radar-legend">
                                                <span><span className="legend-dot" style={{ background: '#e11d48' }} />Bệnh nhân</span>
                                                <span><span className="legend-dot" style={{ background: '#10b981' }} />Ngưỡng tham chiếu</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`recommendations ${diagnosis.hasDisease ? 'danger' : 'safe'}`}>
                                        <h4 className="rec-title">
                                            {diagnosis.hasDisease
                                                ? <><MedicineBoxOutlined /> Khuyến nghị Y khoa</>
                                                : <><FireOutlined /> Khuyến nghị duy trì</>}
                                        </h4>
                                        <ul className="rec-list">
                                            {diagnosis.hasDisease ? (<>
                                                <li>Đặt lịch hẹn với bác sĩ chuyên khoa để làm các xét nghiệm chuyên sâu (ECG, Siêu âm tim).</li>
                                                <li>Kiểm soát chặt chẽ huyết áp và lên phác đồ giảm mỡ máu với chuyên gia.</li>
                                                <li>Ngừng hoàn toàn các chất kích thích (thuốc lá, rượu bia) và áp dụng chế độ ăn kiêng.</li>
                                                <li>Theo dõi huyết áp và nhịp tim hàng ngày, ghi chép lại để báo cáo bác sĩ.</li>
                                            </>) : (<>
                                                <li>Tiếp tục duy trì cường độ vận động tối thiểu 150 phút/tuần (đi bộ, bơi lội, đạp xe).</li>
                                                <li>Giữ vững chế độ dinh dưỡng, ưu tiên thực phẩm giàu chất xơ và rau xanh.</li>
                                                <li>Hạn chế muối (&lt;5g/ngày) và đường để duy trì huyết áp và đường huyết ổn định.</li>
                                                <li>Tái tầm soát trên hệ thống sau 6 tháng để cập nhật và theo dõi chỉ số.</li>
                                            </>)}
                                        </ul>
                                    </div>

                                    <button className="btn btn-ghost reset-btn" onClick={resetForm}>
                                        <ReloadOutlined /> Phân tích hồ sơ mới
                                    </button>
                                </div>
                            )}

                            {/* ─── BATCH RESULT PANEL ─── */}
                            {batchResult && (
                                <div className="batch-result-panel">
                                    {/* Summary header */}
                                    <div className="batch-summary-header">
                                        <div className="batch-summary-stats">
                                            <div className="batch-stat total">
                                                <span className="batch-stat-value">{batchResult.total}</span>
                                                <span className="batch-stat-label">Tổng bệnh nhân</span>
                                            </div>
                                            <div className="batch-stat risk">
                                                <span className="batch-stat-value">{batchResult.highRisk}</span>
                                                <span className="batch-stat-label">Nguy cơ cao</span>
                                            </div>
                                            <div className="batch-stat safe">
                                                <span className="batch-stat-value">{batchResult.safe}</span>
                                                <span className="batch-stat-label">An toàn</span>
                                            </div>
                                            <div className="batch-stat pct">
                                                <span className="batch-stat-value">
                                                    {Math.round((batchResult.highRisk / batchResult.total) * 100)}%
                                                </span>
                                                <span className="batch-stat-label">Tỷ lệ nguy cơ</span>
                                            </div>
                                        </div>
                                        <div className="batch-donut-wrapper">
                                            <BatchSummaryChart
                                                highRisk={batchResult.highRisk}
                                                safe={batchResult.safe}
                                                darkMode={darkMode}
                                            />
                                        </div>
                                    </div>

                                    {/* Column mapping note */}
                                    {batchResult.columnMappingApplied && Object.keys(batchResult.columnMappingApplied).length > 0 && (
                                        <div className="mapping-notice">
                                            <InfoCircleOutlined /> Hệ thống đã tự động ánh xạ tên cột:{' '}
                                            {Object.entries(batchResult.columnMappingApplied).map(([orig, mapped]) => (
                                                orig !== mapped ? <span key={orig}><code>{orig}</code> → <code>{mapped}</code></span> : null
                                            )).filter(Boolean)}
                                        </div>
                                    )}

                                    {/* Result Table */}
                                    <BatchResultTable results={batchResult.results} />

                                    <button className="btn btn-ghost reset-btn" onClick={() => {
                                        setBatchResult(null);
                                        setUploadFile(null);
                                        setUploadError(null);
                                        setActiveTab('upload');
                                    }}>
                                        <ReloadOutlined /> Upload file mới
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── RIGHT: History Sidebar ─────────────────────── */}
                    <aside className="main-right">
                        <div className="history-card">
                            <div className="history-header">
                                <h3 className="history-title"><ClockCircleOutlined /> Lịch sử phân tích</h3>
                                {history.length > 0 && (
                                    <button className="clear-btn" onClick={clearHistory}>
                                        <DeleteOutlined /> Xóa tất cả
                                    </button>
                                )}
                            </div>
                            {history.length === 0 ? (
                                <div className="history-empty">
                                    <div className="history-empty-icon">📋</div>
                                    <p>Chưa có lịch sử phân tích</p>
                                    <span>Kết quả sẽ được lưu tự động tại đây</span>
                                </div>
                            ) : (
                                <div className="history-list">
                                    {history.map((item, i) => (
                                        <HistoryItem key={item.id} item={item} index={i}
                                            onRemove={removeHistory} />
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="info-card">
                            <h4><BulbOutlined /> Về mô hình AI</h4>
                            <p>
                                Hệ thống sử dụng <strong>XGBoost</strong> được huấn luyện qua
                                <strong> 5-Fold Cross Validation</strong>, đạt{' '}
                                <strong>95% accuracy</strong> trên tập Test độc lập (20% dữ liệu).
                            </p>
                            <p>
                                12 đặc trưng được phân tích: chỉ số sinh học, lối sống và tiền sử
                                di truyền để đưa ra dự đoán nhị phân (Có/Không bệnh tim).
                            </p>
                            <p className="disclaimer">
                                ⚠️ Kết quả chỉ mang tính tham khảo hỗ trợ, không thay thế chẩn đoán y khoa chuyên nghiệp.
                            </p>
                        </div>
                    </aside>
                </div>

                {/* ══ FOOTER ══════════════════════════════════════════ */}
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