const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Correctly import all controller functions from the controller file
const {
    uploadDataset,
    getDatasets,
    getDatasetById,
    analyzeDataset,
    quickAnalyzeDataset,
} = require('../controllers/datasetController');

// Set up multer for file storage
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/'); // Ensure you have an 'uploads' folder
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

const upload = multer({ storage });

// --- Define the API routes ---

// Route for performing a one-time "quick" analysis
router.route('/quick-analysis').post(protect, upload.single('dataset'), quickAnalyzeDataset);

// Route for uploading and permanently saving a dataset
router.route('/upload').post(protect, upload.single('dataset'), uploadDataset);

// Route for getting all saved datasets for a user
router.route('/').get(protect, getDatasets);

// Routes for a specific saved dataset
router.route('/:id').get(protect, getDatasetById);
router.route('/:id/analysis').get(protect, analyzeDataset);


module.exports = router;

