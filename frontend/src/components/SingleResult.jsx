import React from 'react';
import {
    CheckCircleOutlined, ExclamationCircleOutlined,
    MedicineBoxOutlined, FireOutlined, ReloadOutlined,
} from '@ant-design/icons';
import { Progress } from 'antd';
import HealthRadar from './HealthRadar';

/**
 * SingleResult
 * Full result panel for a single-patient prediction:
 *  - Result banner (safe / danger)
 *  - Confidence progress ring
 *  - Radar chart
 *  - Medical recommendations
 *  - Reset button
 */
const SingleResult = ({ diagnosis, darkMode, onReset }) => {
    const { hasDisease, confidence, values } = diagnosis;
    const color = hasDisease ? '#e11d48' : '#10b981';

    return (
        <div className="result-panel">
            {/* Banner */}
            <div className={`result-banner ${hasDisease ? 'danger' : 'safe'}`}>
                <div className="result-banner-icon">
                    {hasDisease ? <ExclamationCircleOutlined /> : <CheckCircleOutlined />}
                </div>
                <div>
                    <h2 className="result-title">
                        {hasDisease ? 'PHÁT HIỆN NGUY CƠ CAO' : 'CHỈ SỐ SINH HỌC ỔN ĐỊNH'}
                    </h2>
                    <p className="result-subtitle">
                        {hasDisease
                            ? 'Mô hình thuật toán phát hiện các đặc trưng sinh học có khả năng bệnh lý.'
                            : 'Các chỉ số hiện tại nằm trong ngưỡng an toàn của mô hình.'}
                    </p>
                </div>
            </div>

            {/* Charts */}
            <div className="charts-grid">
                {/* Confidence ring */}
                <div
                    className="chart-card"
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                >
                    <div className="chart-title">Độ tin cậy dự đoán</div>
                    <Progress
                        type="circle"
                        percent={confidence}
                        strokeColor={color}
                        trailColor={darkMode ? 'rgba(148,163,184,0.15)' : 'rgba(0,0,0,0.06)'}
                        strokeWidth={8}
                        size={120}
                        format={pct => (
                            <span style={{ color, fontSize: 22, fontWeight: 700 }}>
                                {pct}%
                            </span>
                        )}
                    />
                    <div className="chart-sub" style={{ marginTop: 10, textAlign: 'center' }}>
                        Dựa trên phân tích xác suất của mô hình XGBoost
                    </div>
                </div>

                {/* Radar */}
                <div className="chart-card">
                    <div className="chart-title">Phân tích đa chiều 6 chỉ số</div>
                    <HealthRadar values={values} darkMode={darkMode} />
                    <div className="radar-legend">
                        <span>
                            <span className="legend-dot" style={{ background: '#e11d48' }} />
                            Bệnh nhân
                        </span>
                        <span>
                            <span className="legend-dot" style={{ background: '#10b981' }} />
                            Ngưỡng tham chiếu
                        </span>
                    </div>
                </div>
            </div>

            {/* Recommendations */}
            <div className={`recommendations ${hasDisease ? 'danger' : 'safe'}`}>
                <h4 className="rec-title">
                    {hasDisease
                        ? <><MedicineBoxOutlined /> Khuyến nghị Y khoa</>
                        : <><FireOutlined /> Khuyến nghị duy trì</>}
                </h4>
                <ul className="rec-list">
                    {hasDisease ? (
                        <>
                            <li>Đặt lịch hẹn với bác sĩ chuyên khoa để làm các xét nghiệm chuyên sâu (ECG, Siêu âm tim).</li>
                            <li>Kiểm soát chặt chẽ huyết áp và lên phác đồ giảm mỡ máu với chuyên gia.</li>
                            <li>Ngừng hoàn toàn các chất kích thích (thuốc lá, rượu bia) và áp dụng chế độ ăn kiêng.</li>
                            <li>Theo dõi huyết áp và nhịp tim hàng ngày, ghi chép lại để báo cáo bác sĩ.</li>
                        </>
                    ) : (
                        <>
                            <li>Tiếp tục duy trì cường độ vận động tối thiểu 150 phút/tuần (đi bộ, bơi lội, đạp xe).</li>
                            <li>Giữ vững chế độ dinh dưỡng, ưu tiên thực phẩm giàu chất xơ và rau xanh.</li>
                            <li>Hạn chế muối (&lt;5g/ngày) và đường để duy trì huyết áp và đường huyết ổn định.</li>
                            <li>Tái tầm soát trên hệ thống sau 6 tháng để cập nhật và theo dõi chỉ số.</li>
                        </>
                    )}
                </ul>
            </div>

            <button className="btn btn-ghost reset-btn" onClick={onReset}>
                <ReloadOutlined /> Phân tích hồ sơ mới
            </button>
        </div>
    );
};

export default SingleResult;
