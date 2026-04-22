let timeOffset = 0; // Offset in milliseconds

module.exports = {
    // Add days to the simulated clock
    addDays: (days) => {
        timeOffset += days * 24 * 60 * 60 * 1000;
    },

    // Add months (approx 30 days) to the simulated clock
    addMonths: (months) => {
        timeOffset += months * 30 * 24 * 60 * 60 * 1000;
    },

    // Get the current simulated date
    getCurrentDate: () => {
        return new Date(Date.now() + timeOffset);
    },

    // Reset to real time
    reset: () => {
        timeOffset = 0;
    },

    // Get current offset summary
    getStatus: () => {
        return {
            offset: timeOffset,
            simulatedDate: new Date(Date.now() + timeOffset)
        };
    }
};
