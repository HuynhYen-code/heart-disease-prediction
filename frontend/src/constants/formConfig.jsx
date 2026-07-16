import React from 'react';
import {
    UserOutlined, DashboardOutlined, FireOutlined,
} from '@ant-design/icons';

// ================================================================
// FORM STEPS
// ================================================================

export const STEPS = [
    { title: 'Cơ bản', subtitle: 'Thông tin cơ thể', icon: <UserOutlined /> },
    { title: 'Lâm sàng', subtitle: 'Chỉ số xét nghiệm', icon: <DashboardOutlined /> },
    { title: 'Lối sống', subtitle: 'Hành vi & Di truyền', icon: <FireOutlined /> },
];

export const FIELDS_BY_STEP = [
    ['age', 'gender', 'bmi', 'heart_rate'],
    ['glucose_mg_dl', 'cholesterol_mg_dl', 'systolic_bp', 'diastolic_bp'],
    ['smoking', 'alcohol_consumption', 'physical_activity', 'family_history'],
];

// ================================================================
// COLUMN LABELS (for display & CSV validation messages)
// ================================================================

export const COLUMN_LABELS = {
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

// ================================================================
// RADAR CHART NORMALISATION
//
// Safe values are derived from the MEAN of 497 healthy patients
// (disease = "No") in disease_prediction_2026_clean.csv:
//
//   glucose_mg_dl     → mean 98.43  / max 180 * 100 ≈ 55
//   cholesterol_mg_dl → mean 204.46 / max 240 * 100 ≈ 85
//   systolic_bp       → mean 120.29 / max 180 * 100 ≈ 67
//   bmi               → mean 25.21  / max 40  * 100 ≈ 63
//   heart_rate        → mean 76.41  / max 120 * 100 ≈ 64
//   age               → mean 46.35  / max 80  * 100 ≈ 58
// ================================================================

export const getRadarData = (v) => {
    if (!v) return [];
    return [
        { metric: 'Glucose',     value: Math.min(Math.round(((v.glucose_mg_dl     || 0) / 180) * 100), 100), safe: 55 },
        { metric: 'Cholesterol', value: Math.min(Math.round(((v.cholesterol_mg_dl || 0) / 240) * 100), 100), safe: 85 },
        { metric: 'Huyết áp',   value: Math.min(Math.round(((v.systolic_bp       || 0) / 180) * 100), 100), safe: 67 },
        { metric: 'BMI',         value: Math.min(Math.round(((v.bmi              || 0) / 40 ) * 100), 100), safe: 63 },
        { metric: 'Nhịp tim',   value: Math.min(Math.round(((v.heart_rate        || 0) / 120) * 100), 100), safe: 64 },
        { metric: 'Tuổi',       value: Math.min(Math.round(((v.age               || 0) / 80 ) * 100), 100), safe: 58 },
    ];
};
