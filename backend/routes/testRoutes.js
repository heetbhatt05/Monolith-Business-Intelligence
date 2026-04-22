const express = require('express');
const router = express.Router();
const timeStore = require('../utils/timeStore');

// @route   POST /api/test/time/add-day
// @desc    Advance system time by 1 day
router.post('/time/add-day', (req, res) => {
    timeStore.addDays(1);
    res.json({
        message: "Time Travel: +1 Day",
        currentSimulatedDate: timeStore.getCurrentDate()
    });
});

// @route   POST /api/test/time/add-month
// @desc    Advance system time by 1 month
router.post('/time/add-month', (req, res) => {
    timeStore.addMonths(1);
    res.json({
        message: "Time Travel: +1 Month",
        currentSimulatedDate: timeStore.getCurrentDate()
    });
});

// @route   GET /api/test/time/current
// @desc    Get current simulated date
router.get('/time/current', (req, res) => {
    res.json({
        currentSimulatedDate: timeStore.getCurrentDate()
    });
});

// @route   POST /api/test/time/reset
// @desc    Reset to real time
router.post('/time/reset', (req, res) => {
    timeStore.reset();
    res.json({
        message: "Time Reset to Now",
        currentSimulatedDate: timeStore.getCurrentDate()
    });
});

module.exports = router;
