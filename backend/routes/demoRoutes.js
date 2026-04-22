const express = require('express');
const router = express.Router();
const demoDataService = require('../services/demoDataService');

router.post('/generate', async (req, res) => {
    const { months } = req.body;
    const result = await demoDataService.generateDemoData(months || 6);
    if (!result.success) {
        return res.status(400).json(result);
    }
    res.json(result);
});

router.delete('/clear', async (req, res) => {
    const result = await demoDataService.clearDemoData();
    if (!result.success) {
        return res.status(500).json(result);
    }
    res.json(result);
});

module.exports = router;
