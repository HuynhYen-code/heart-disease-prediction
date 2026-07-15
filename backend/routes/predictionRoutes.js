const express = require('express');
const router = express.Router();
const { predictHeartDisease, predictBatchUpload } = require('../controllers/predictionController');

// Route nhận request từ React: POST /api/predict (nhập tay)
router.post('/predict', predictHeartDisease);

// Route upload CSV: POST /api/predict/upload
router.post('/predict/upload', ...predictBatchUpload);

module.exports = router;