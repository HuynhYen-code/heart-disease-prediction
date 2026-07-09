const express = require('express');
const cors = require('cors');
require('dotenv').config();

const predictionRoutes = require('./routes/predictionRoutes');

const app = express();

// Middleware
app.use(cors()); // Cho phép React (port 3000) gọi vào
app.use(express.json()); // Phân tích JSON body

// Đăng ký routes
app.use('/api', predictionRoutes);

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Node.js Backend đang chạy tại http://localhost:${PORT}`);
    console.log(`🔗 Sẵn sàng nhận request từ React tại: /api/predict`);
});