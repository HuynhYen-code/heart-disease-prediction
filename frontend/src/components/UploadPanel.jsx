import React from 'react';
import {
    FileTextOutlined, BarChartOutlined,
} from '@ant-design/icons';
import { COLUMN_LABELS } from '../constants/formConfig';
import DropZone from './DropZone';
import MissingValuesError from './MissingValuesError';

/**
 * UploadPanel
 * CSV batch upload tab: drop zone, file preview, error panel, predict button.
 */
const UploadPanel = ({
    uploadFile,
    isDragging,
    setIsDragging,
    uploadLoading,
    uploadError,
    onFileSelect,
    onRemoveFile,
    onPredict,
}) => (
    <div className="upload-panel">
        {/* Header */}
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
                    <span key={k} className="col-chip">
                        <code>{k}</code> ({v})
                    </span>
                ))}
            </div>
        </div>

        {/* Drop Zone or File Preview */}
        {!uploadFile ? (
            <DropZone
                onFileSelect={onFileSelect}
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
                <button
                    className="file-remove-btn"
                    onClick={onRemoveFile}
                    title="Xóa file"
                >
                    ×
                </button>
            </div>
        )}

        {/* Error Panel */}
        {uploadError && <MissingValuesError detail={uploadError} />}

        {/* Predict Button */}
        <button
            className={`btn btn-upload-predict ${uploadLoading ? 'loading' : ''}`}
            onClick={onPredict}
            disabled={!uploadFile || uploadLoading}
        >
            {uploadLoading
                ? <><span className="loading-spinner">⟳</span> Đang phân tích dữ liệu...</>
                : <><BarChartOutlined /> Phân tích hàng loạt</>}
        </button>
    </div>
);

export default UploadPanel;
