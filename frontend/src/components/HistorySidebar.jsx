import React from 'react';
import {
    ClockCircleOutlined, DeleteOutlined, BulbOutlined,
} from '@ant-design/icons';
import HistoryItem from './HistoryItem';

/**
 * HistorySidebar
 * Right sidebar containing:
 *  - Analysis history list (persisted via localStorage in usePrediction)
 *  - Info card about the AI model
 */
const HistorySidebar = ({ history, onRemove, onClear }) => (
    <aside className="main-right">
        {/* History card */}
        <div className="history-card">
            <div className="history-header">
                <h3 className="history-title">
                    <ClockCircleOutlined /> Lịch sử phân tích
                </h3>
                {history.length > 0 && (
                    <button className="clear-btn" onClick={onClear}>
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
                        <HistoryItem
                            key={item.id}
                            item={item}
                            index={i}
                            onRemove={onRemove}
                        />
                    ))}
                </div>
            )}
        </div>

        {/* AI info card */}
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
);

export default HistorySidebar;
