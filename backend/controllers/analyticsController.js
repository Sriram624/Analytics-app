const Dataset = require('../models/datasetModel');
const asyncHandler = require('express-async-handler');

// @desc    Get an overview of all analytics data
// @route   GET /api/analytics/overview
// @access  Private
const getAnalyticsOverview = asyncHandler(async (req, res) => {
    // We only want datasets owned by the current user
    const datasets = await Dataset.find({ user: req.user._id });

    if (datasets) {
        let totalDatasets = datasets.length;
        let totalRows = 0;
        let numericColumns = 0;
        let categoricalColumns = 0;

        datasets.forEach(dataset => {
            totalRows += dataset.rowCount;
            dataset.columnAnalysis.forEach(col => {
                if (col.type === 'Numeric') {
                    numericColumns++;
                } else {
                    categoricalColumns++;
                }
            });
        });
        
        // Data for a chart showing column type distribution
        const columnTypeData = [
            { name: 'Numeric', count: numericColumns },
            { name: 'Categorical', count: categoricalColumns },
        ];

        res.json({
            totalDatasets,
            totalRows,
            columnTypeData
        });

    } else {
        res.status(404);
        throw new Error('No datasets found');
    }
});

module.exports = { getAnalyticsOverview };

