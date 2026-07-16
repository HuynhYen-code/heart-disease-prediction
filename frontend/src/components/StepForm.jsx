import React from 'react';
import { Form, InputNumber, Select, Space, Tooltip } from 'antd';
import {
    UserOutlined, DashboardOutlined, FireOutlined, HeartOutlined,
    ArrowLeftOutlined, ArrowRightOutlined, InfoCircleOutlined,
} from '@ant-design/icons';
import { STEPS } from '../constants/formConfig';

const { Option } = Select;

/**
 * StepForm
 * 3-step manual input form with step indicator and navigation buttons.
 */
const StepForm = ({ form, step, loading, onNext, onPrev, onFinish }) => (
    <>
        {/* ── Step Progress ── */}
        <div className="form-header">
            <div className="step-progress">
                {STEPS.map((s, i) => (
                    <div
                        key={i}
                        className={`step-item${i === step ? ' active' : i < step ? ' done' : ''}`}
                    >
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

        {/* ── Form ── */}
        <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>

            {/* Step 1 – Basic Info */}
            <div className="form-step" style={{ display: step === 0 ? 'block' : 'none' }}>
                <div className="section-label"><UserOutlined /> Chỉ số cơ thể &amp; Nền tảng</div>
                <div className="form-grid">
                    <Form.Item
                        name="age"
                        label="Tuổi bệnh nhân"
                        rules={[{ required: true, message: 'Vui lòng nhập tuổi' }]}
                    >
                        <InputNumber style={{ width: '100%' }} min={18} max={120}
                            placeholder="18 – 120" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="gender"
                        label="Giới tính"
                        rules={[{ required: true, message: 'Vui lòng chọn' }]}
                    >
                        <Select placeholder="Chọn giới tính" size="large">
                            <Option value="Male">Nam</Option>
                            <Option value="Female">Nữ</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="bmi"
                        label={
                            <Space>
                                Chỉ số khối BMI
                                <Tooltip title="BMI = Cân nặng (kg) / Chiều cao² (m). Bình thường: 18.5–24.9">
                                    <InfoCircleOutlined style={{ color: '#94a3b8' }} />
                                </Tooltip>
                            </Space>
                        }
                        rules={[{ required: true, message: 'Vui lòng nhập BMI' }]}
                    >
                        <InputNumber style={{ width: '100%' }} min={10} max={60}
                            step={0.1} placeholder="10 – 60" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="heart_rate"
                        label={
                            <Space>
                                Nhịp tim nghỉ ngơi (BPM)
                                <Tooltip title="Bình thường khi nghỉ: 60–100 BPM">
                                    <InfoCircleOutlined style={{ color: '#94a3b8' }} />
                                </Tooltip>
                            </Space>
                        }
                        rules={[{ required: true, message: 'Vui lòng nhập nhịp tim' }]}
                    >
                        <InputNumber style={{ width: '100%' }} min={30} max={200}
                            placeholder="60 – 100 BPM" size="large" />
                    </Form.Item>
                </div>
            </div>

            {/* Step 2 – Clinical Tests */}
            <div className="form-step" style={{ display: step === 1 ? 'block' : 'none' }}>
                <div className="section-label"><DashboardOutlined /> Thông số Xét nghiệm</div>
                <div className="form-grid">
                    <Form.Item
                        name="glucose_mg_dl"
                        label={
                            <Space>
                                Đường huyết (mg/dL)
                                <Tooltip title="Lúc đói bình thường: 70–99. Tiền ĐTĐ: 100–125. ĐTĐ: ≥126">
                                    <InfoCircleOutlined style={{ color: '#94a3b8' }} />
                                </Tooltip>
                            </Space>
                        }
                        rules={[{ required: true, message: 'Vui lòng nhập' }]}
                    >
                        <InputNumber style={{ width: '100%' }} min={40} max={500}
                            placeholder="70 – 99 mg/dL" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="cholesterol_mg_dl"
                        label={
                            <Space>
                                Cholesterol (mg/dL)
                                <Tooltip title="Tốt: <200. Ranh giới: 200–239. Cao: ≥240 mg/dL">
                                    <InfoCircleOutlined style={{ color: '#94a3b8' }} />
                                </Tooltip>
                            </Space>
                        }
                        rules={[{ required: true, message: 'Vui lòng nhập' }]}
                    >
                        <InputNumber style={{ width: '100%' }} min={50} max={500}
                            placeholder="< 200 mg/dL" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="systolic_bp"
                        label={
                            <Space>
                                Huyết áp Tâm thu (mmHg)
                                <Tooltip title="Bình thường: <120. Tăng nhẹ: 120–129. Tăng cao: ≥130">
                                    <InfoCircleOutlined style={{ color: '#94a3b8' }} />
                                </Tooltip>
                            </Space>
                        }
                        rules={[{ required: true, message: 'Vui lòng nhập' }]}
                    >
                        <InputNumber style={{ width: '100%' }} min={70} max={250}
                            placeholder="< 120 mmHg" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="diastolic_bp"
                        label={
                            <Space>
                                Huyết áp Tâm trương (mmHg)
                                <Tooltip title="Bình thường: <80. Tăng cao: ≥90 mmHg">
                                    <InfoCircleOutlined style={{ color: '#94a3b8' }} />
                                </Tooltip>
                            </Space>
                        }
                        rules={[{ required: true, message: 'Vui lòng nhập' }]}
                    >
                        <InputNumber style={{ width: '100%' }} min={40} max={150}
                            placeholder="< 80 mmHg" size="large" />
                    </Form.Item>
                </div>
            </div>

            {/* Step 3 – Lifestyle */}
            <div className="form-step" style={{ display: step === 2 ? 'block' : 'none' }}>
                <div className="section-label"><FireOutlined /> Hành vi &amp; Di truyền</div>
                <div className="form-grid">
                    <Form.Item
                        name="smoking"
                        label="Hút thuốc lá"
                        rules={[{ required: true, message: 'Vui lòng chọn' }]}
                    >
                        <Select placeholder="Chọn trạng thái" size="large">
                            <Option value="Yes">Có hút thuốc</Option>
                            <Option value="No">Không hút</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="alcohol_consumption"
                        label="Sử dụng rượu bia"
                        rules={[{ required: true, message: 'Vui lòng chọn' }]}
                    >
                        <Select placeholder="Chọn trạng thái" size="large">
                            <Option value="Yes">Có sử dụng</Option>
                            <Option value="No">Không sử dụng</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="physical_activity"
                        label="Mức độ vận động thể chất"
                        rules={[{ required: true, message: 'Vui lòng chọn' }]}
                    >
                        <Select placeholder="Chọn mức độ" size="large">
                            <Option value="Low">Thấp (Ít vận động)</Option>
                            <Option value="Medium">Trung bình (2-3 ngày/tuần)</Option>
                            <Option value="High">Cao (4-5 ngày/tuần)</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="family_history"
                        label="Tiền sử bệnh tim trong gia đình"
                        rules={[{ required: true, message: 'Vui lòng chọn' }]}
                    >
                        <Select placeholder="Chọn trạng thái" size="large">
                            <Option value="Yes">Có tiền sử bệnh</Option>
                            <Option value="No">Không có</Option>
                        </Select>
                    </Form.Item>
                </div>
            </div>

            {/* ── Navigation ── */}
            <div className="form-nav">
                {step > 0 ? (
                    <button type="button" className="btn btn-ghost" onClick={onPrev}>
                        <ArrowLeftOutlined /> Quay lại
                    </button>
                ) : (
                    <div />
                )}

                {step < 2 ? (
                    <button type="button" className="btn btn-primary" onClick={onNext}>
                        Tiếp tục <ArrowRightOutlined />
                    </button>
                ) : (
                    <button type="submit" className="btn btn-danger" disabled={loading}>
                        {loading
                            ? <><span className="loading-spinner">⟳</span> Đang phân tích...</>
                            : <><HeartOutlined /> Phân tích AI ngay</>}
                    </button>
                )}
            </div>
        </Form>
    </>
);

export default StepForm;
