import React from 'react';
import { WarningOutlined } from '@ant-design/icons';
import { COLUMN_LABELS } from '../constants/formConfig';

/**
 * MissingValuesError
 * Renders a detailed error panel for CSV validation failures returned
 * by the backend (MISSING_COLUMNS or MISSING_VALUES).
 */
const MissingValuesError = ({ detail }) => {
    if (!detail) return null;

    if (detail.error_type === 'MISSING_COLUMNS') {
        return (
            <div className="upload-error-box column-error">
                <div className="error-title">
                    <WarningOutlined /> Không nhận dạng được cột dữ liệu
                </div>
                <p>{detail.message}</p>
                <div className="error-cols-grid">
                    <div>
                        <strong>Cột còn thiếu:</strong>
                        <ul>
                            {detail.missing_columns.map(c => (
                                <li key={c}>
                                    <code>{c}</code> — {COLUMN_LABELS[c] || c}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <strong>Cột phát hiện trong file:</strong>
                        <ul>
                            {detail.detected_columns.map(c => (
                                <li key={c}><code>{c}</code></li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    if (detail.error_type === 'MISSING_VALUES') {
        return (
            <div className="upload-error-box missing-error">
                <div className="error-title">
                    <WarningOutlined /> Dữ liệu bị khuyết — Cần bổ sung trước khi dự đoán
                </div>
                <p>{detail.message}</p>
                <div className="missing-table-scroll">
                    <table className="missing-table">
                        <thead>
                            <tr>
                                <th>Tên cột</th>
                                <th>Ý nghĩa</th>
                                <th>Số ô thiếu</th>
                                <th>Hàng bị thiếu</th>
                            </tr>
                        </thead>
                        <tbody>
                            {detail.missing_details.map(m => (
                                <tr key={m.column}>
                                    <td><code>{m.column}</code></td>
                                    <td>{COLUMN_LABELS[m.column] || m.column}</td>
                                    <td className="td-count">{m.count}</td>
                                    <td className="td-rows">
                                        {m.missing_rows.slice(0, 10).join(', ')}
                                        {m.missing_rows.length > 10
                                            ? ` ... (+${m.missing_rows.length - 10} hàng)`
                                            : ''}
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

export default MissingValuesError;
