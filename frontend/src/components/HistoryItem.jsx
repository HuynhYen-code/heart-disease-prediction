import React from 'react';

/**
 * HistoryItem
 * Renders a single row in the analysis history sidebar.
 */
const HistoryItem = ({ item, index, onRemove }) => {
    const color = item.hasDisease ? '#ef4444' : '#10b981';

    return (
        <div className="history-item" style={{ animationDelay: `${index * 0.05}s` }}>
            <div className="history-item-left">
                <div className="history-dot" style={{ background: color }} />
                <div>
                    <div className="history-date">{item.date} · {item.time}</div>
                    <div className="history-status" style={{ color }}>
                        {item.hasDisease ? 'Phát hiện nguy cơ' : 'Chỉ số ổn định'}
                    </div>
                </div>
            </div>
            <div className="history-item-right">
                <div className="history-score" style={{ color }}>
                    {item.confidence}%
                    <span style={{ fontSize: 10, fontWeight: 400 }}>tin cậy</span>
                </div>
                <button
                    className="history-remove-btn"
                    onClick={() => onRemove(item.id)}
                    title="Xóa mục này"
                >
                    ×
                </button>
            </div>
        </div>
    );
};

export default HistoryItem;
