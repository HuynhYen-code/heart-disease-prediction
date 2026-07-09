const axios = require('axios');

const predictHeartDisease = async (req, res) => {
    try {
        // 1. Lấy dữ liệu bệnh nhân từ body request (đã được React map thành số)
        const patientData = req.body;

        // 2. Gọi HTTP POST sang service Python (FastAPI/Flask)
        const pythonServiceUrl = process.env.PYTHON_AI_SERVICE_URL;

        const response = await axios.post(pythonServiceUrl, patientData);

        // 4. Trả về cho Frontend chuẩn xác để UI dễ dàng render
        res.status(200).json({
            status: "OK",
            message: "Dự đoán thành công",
            data: {
                hasDisease: response.data.prediction === 1,
                probability: response.data.probability
            }
        });

    } catch (error) {
        // Lấy chi tiết báo lỗi từ FastAPI (nếu có)
        const aiErrorDetail = error.response?.data?.detail || error.message;
        console.error("Lỗi khi kết nối với AI Service:", aiErrorDetail);

        return res.status(500).json({
            status: "ERROR",
            message: "Lỗi hệ thống máy chủ hoặc AI Service không phản hồi",
            error_details: aiErrorDetail
        });
    }
};

module.exports = {
    predictHeartDisease
};