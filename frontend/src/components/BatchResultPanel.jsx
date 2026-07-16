import React from 'react';
import { ReloadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import BatchSummaryChart from './BatchSummaryChart';
import BatchResultTable from './BatchResultTable';

/**
 * BatchResultPanel
 * Summary stats + donut chart + detailed result table for batch CSV predictions.
 */
const BatchResultPanel = ({ batchResult, darkMode, onReset }) => {
    const { total, highRisk, safe, results, columnMappingApplied } = batchResult;
    const riskPct = Math.round((highRisk / total) * 100);

    return (
        <div className="batch-result-panel">
            {/* Summary header */}
            <div className="batch-summary-header">
                <div className="batch-summary-stats">
                    <div className="batch-stat total">
                        <span className="batch-stat-value">{total}</span>
                        <span className="batch-stat-label">Tổng bệnh nhân</span>
                    </div>
                    <div className="batch-stat risk">
                        <span className="batch-stat-value">{highRisk}</span>
                        <span className="batch-stat-label">Nguy cơ cao</span>
                    </div>
                    <div className="batch-stat safe">
                        <span className="batch-stat-value">{safe}</span>
                        <span className="batch-stat-label">An toàn</span>
                    </div>
                    <div className="batch-stat pct">
                        <span className="batch-stat-value">{riskPct}%</span>
                        <span className="batch-stat-label">Tỷ lệ nguy cơ</span>
                    </div>
                </div>

                <div className="batch-donut-wrapper">
                    <BatchSummaryChart highRisk={highRisk} safe={safe} darkMode={darkMode} />
                </div>
            </div>

            {/* Column mapping notice */}
            {columnMappingApplied && Object.keys(columnMappingApplied).length > 0 && (
                <div className="mapping-notice">
                    <InfoCircleOutlined /> Hệ thống đã tự động ánh xạ tên cột:{' '}
                    {Object.entries(columnMappingApplied).map(([orig, mapped]) =>
                        orig !== mapped
                            ? <span key={orig}><code>{orig}</code> → <code>{mapped}</code></span>
                            : null
                    ).filter(Boolean)}
                </div>
            )}

            {/* Result table */}
            <BatchResultTable results={results} />

            <button className="btn btn-ghost reset-btn" onClick={onReset}>
                <ReloadOutlined /> Upload file mới
            </button>
        </div>
    );
};

export default BatchResultPanel;
