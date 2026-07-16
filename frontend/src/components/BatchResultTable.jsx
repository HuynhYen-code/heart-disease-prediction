import React, { useState } from 'react';
import { DownloadOutlined } from '@ant-design/icons';

/**
 * BatchResultTable
 * Filterable, sortable table of per-patient batch prediction results.
 */
const BatchResultTable = ({ results }) => {
    const [filter, setFilter]   = useState('all'); // 'all' | 'risk' | 'safe'
    const [sortDesc, setSortDesc] = useState(true);

    const filtered = results
        .filter(r => filter === 'all' ? true : filter === 'risk' ? r.has_disease : !r.has_disease)
        .sort((a, b) => sortDesc ? b.probability - a.probability : a.probability - b.probability);

    const exportCSV = () => {
        const header = 'row_index,has_disease,probability_percent\n';
        const rows   = results
            .map(r => `${r.row_index},${r.has_disease ? 'Yes' : 'No'},${r.probability}`)
            .join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `cardioai_results_${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const riskCount = results.filter(r => r.has_disease).length;
    const safeCount = results.filter(r => !r.has_disease).length;

    return (
        <div className="batch-table-wrapper">
            <div className="batch-table-toolbar">
                <div className="batch-filter-tabs">
                    <button
                        className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        Tất cả ({results.length})
                    </button>
                    <button
                        className={`filter-tab risk ${filter === 'risk' ? 'active' : ''}`}
                        onClick={() => setFilter('risk')}
                    >
                        ⚠ Nguy cơ cao ({riskCount})
                    </button>
                    <button
                        className={`filter-tab safe ${filter === 'safe' ? 'active' : ''}`}
                        onClick={() => setFilter('safe')}
                    >
                        ✓ An toàn ({safeCount})
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
                            <th
                                onClick={() => setSortDesc(d => !d)}
                                style={{ cursor: 'pointer' }}
                            >
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

export default BatchResultTable;
