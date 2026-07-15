const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');

// ── Multer: lưu file vào RAM (không ghi đĩa) ──────────────────────────────────
const storage = multer.memoryStorage();
const upload  = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: (_req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error('Chỉ chấp nhận file CSV.'));
        }
    },
});

// ── Single-patient prediction ──────────────────────────────────────────────────
const predictHeartDisease = async (req, res) => {
    try {
        const patientData = req.body;
        const pythonServiceUrl = process.env.PYTHON_AI_SERVICE_URL;

        const response = await axios.post(pythonServiceUrl, patientData);

        res.status(200).json({
            status: "OK",
            message: "Dự đoán thành công",
            data: {
                hasDisease:  response.data.prediction === 1,
                probability: response.data.probability
            }
        });
    } catch (error) {
        const aiErrorDetail = error.response?.data?.detail || error.message;
        console.error("Lỗi khi kết nối với AI Service:", aiErrorDetail);
        return res.status(500).json({
            status: "ERROR",
            message: "Lỗi hệ thống máy chủ hoặc AI Service không phản hồi",
            error_details: aiErrorDetail
        });
    }
};

// ── Batch prediction via CSV upload ───────────────────────────────────────────
const predictBatchUpload = [
    // 1. Multer middleware xử lý multipart/form-data
    upload.single('file'),

    // 2. Controller chính
    async (req, res) => {
        if (!req.file) {
            return res.status(400).json({
                status: "ERROR",
                message: "Không tìm thấy file CSV trong request."
            });
        }

        try {
            // Forward file buffer sang FastAPI dưới dạng multipart
            const form = new FormData();
            form.append('file', req.file.buffer, {
                filename:    req.file.originalname,
                contentType: 'text/csv',
            });

            const pythonUploadUrl = process.env.PYTHON_AI_SERVICE_URL.replace('/predict', '/predict/upload');

            const response = await axios.post(pythonUploadUrl, form, {
                headers: {
                    ...form.getHeaders(),
                },
                maxContentLength: Infinity,
                maxBodyLength:    Infinity,
            });

            return res.status(200).json({
                status: "OK",
                data:   response.data,
            });
        } catch (error) {
            // FastAPI trả về lỗi chi tiết (missing values, missing columns…)
            const aiError = error.response?.data?.detail;
            const statusCode = error.response?.status || 500;

            return res.status(statusCode).json({
                status: "ERROR",
                message: "Lỗi xử lý file CSV",
                error_details: aiError || error.message,
            });
        }
    }
];

module.exports = {
    predictHeartDisease,
    predictBatchUpload,
};