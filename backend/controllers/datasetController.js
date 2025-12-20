const asyncHandler = require('express-async-handler');
const Dataset = require('../models/datasetModel');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const ss = require('simple-statistics');

// --- HELPER FUNCTION FOR ANALYSIS ---
const performAnalysis = (results) => {
    if (results.length === 0) return [];
    const columnHeaders = Object.keys(results[0]);

    return columnHeaders.map(header => {
        const values = results.map(row => row[header]);
        let numericCount = 0;
        values.forEach(val => {
            if (val != null && !isNaN(parseFloat(val)) && isFinite(val)) {
                numericCount++;
            }
        });

        const isNumeric = (numericCount / results.length) > 0.5;
        const analysisResult = { columnName: header, type: isNumeric ? 'Numeric' : 'Categorical' };

        if (isNumeric) {
            const numericValues = values.map(v => parseFloat(v)).filter(v => !isNaN(v));
            if (numericValues.length > 1) {
                analysisResult.min = ss.min(numericValues);
                analysisResult.max = ss.max(numericValues);
                analysisResult.mean = ss.mean(numericValues);
                analysisResult.median = ss.median(numericValues);
                analysisResult.mode = ss.mode(numericValues);
                analysisResult.variance = ss.variance(numericValues);
                analysisResult.stdDev = ss.standardDeviation(numericValues);
                analysisResult.skewness = ss.sampleSkewness(numericValues);
                analysisResult.kurtosis = ss.sampleKurtosis(numericValues);
            }
        } else {
            analysisResult.uniqueValues = new Set(values).size;
            analysisResult.mode = ss.mode(values);
        }
        return analysisResult;
    });
};


// @desc    Upload and SAVE a new dataset
// @route   POST /api/datasets/upload
// @access  Private
const uploadDataset = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('No file uploaded.');
    }

    const results = [];
    const filePath = path.join(__dirname, '..', req.file.path);

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            fs.unlinkSync(filePath); // Clean up the temp file

            const columnAnalysis = performAnalysis(results);

            const dataset = await Dataset.create({
                user: req.user._id,
                fileName: req.file.originalname,
                filePath: req.file.path,
                rowCount: results.length,
                columnHeaders: Object.keys(results[0] || {}),
                data: results,
                columnAnalysis,
            });

            res.status(201).json({
                _id: dataset._id,
                fileName: dataset.fileName,
                message: 'Dataset uploaded successfully',
            });
        });
});

// @desc    Perform a one-time "quick" analysis without saving
// @route   POST /api/datasets/quick-analysis
// @access  Private
const quickAnalyzeDataset = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('No file uploaded.');
    }

    const results = [];
    const filePath = path.join(__dirname, '..', req.file.path);

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            fs.unlinkSync(filePath); // Clean up the temp file

            const columnAnalysis = performAnalysis(results);
            
            res.status(200).json({
                fileName: req.file.originalname,
                rowCount: results.length,
                columnHeaders: Object.keys(results[0] || {}),
                analysis: columnAnalysis,
                data: results,
            });
        });
});


// @desc    Get all datasets for a user
// @route   GET /api/datasets
// @access  Private
const getDatasets = asyncHandler(async (req, res) => {
    const datasets = await Dataset.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(datasets);
});


// @desc    Get a single dataset by ID
// @route   GET /api/datasets/:id
// @access  Private
const getDatasetById = asyncHandler(async (req, res) => {
    const dataset = await Dataset.findById(req.params.id);
    if (dataset && dataset.user.toString() === req.user._id.toString()) {
        res.json(dataset);
    } else {
        res.status(404);
        throw new Error('Dataset not found');
    }
});


// @desc    Get the analysis for a saved dataset
// @route   GET /api/datasets/:id/analysis
// @access  Private
const analyzeDataset = asyncHandler(async (req, res) => {
    const dataset = await Dataset.findById(req.params.id);
    if (dataset && dataset.user.toString() === req.user._id.toString()) {
        res.json({
            fileName: dataset.fileName,
            rowCount: dataset.rowCount,
            columnHeaders: dataset.columnHeaders,
            analysis: dataset.columnAnalysis,
            data: dataset.data,
        });
    } else {
        res.status(404);
        throw new Error('Dataset not found');
    }
});

// Make sure all functions are exported
module.exports = {
    uploadDataset,
    getDatasets,
    getDatasetById,
    analyzeDataset,
    quickAnalyzeDataset,
};

