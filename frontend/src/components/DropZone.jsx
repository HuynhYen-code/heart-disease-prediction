import React, { useRef, useCallback } from 'react';
import { UploadOutlined } from '@ant-design/icons';

/**
 * DropZone
 * Drag-and-drop / click-to-browse CSV file selector.
 */
const DropZone = ({ onFileSelect, isDragging, setIsDragging }) => {
    const inputRef = useRef(null);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) onFileSelect(file);
    }, [onFileSelect, setIsDragging]);

    const handleDragOver  = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = ()  => setIsDragging(false);

    return (
        <div
            className={`drop-zone ${isDragging ? 'dragging' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => inputRef.current?.click()}
        >
            <input
                ref={inputRef}
                type="file"
                accept=".csv"
                hidden
                onChange={e => { if (e.target.files[0]) onFileSelect(e.target.files[0]); }}
            />
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

export default DropZone;
