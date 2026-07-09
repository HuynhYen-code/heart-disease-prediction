const express = require('express');
const router = express.Router();
const { predictHeartDisease } = require('../controllers/predictionController');

// Route nhận request từ React: POST /api/predict
router.post('/predict', predictHeartDisease);

module.exports = router;