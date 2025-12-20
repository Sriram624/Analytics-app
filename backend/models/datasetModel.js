const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
    columnName: { type: String, required: true },
    type: { type: String, enum: ['Numeric', 'Categorical'], required: true },
    mean: { type: Number },
    median: { type: Number },
    min: { type: Number },
    max: { type: Number },
    count: { type: Number },
    uniqueValues: { type: Number },
    topValue: { type: mongoose.Schema.Types.Mixed },
}, { _id: false });

const datasetSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        fileName: {
            type: String,
            required: true,
        },
        filePath: {
            type: String,
            required: true,
        },
        rowCount: {
            type: Number,
            required: true,
        },
        columnHeaders: {
            type: [String],
            required: true,
        },
        data: {
            type: [mongoose.Schema.Types.Mixed], // Stores the raw CSV data as an array of objects
            required: true,
        },
        columnAnalysis: [analysisSchema], // Stores the analysis for each column
    },
    {
        timestamps: true,
    }
);

const Dataset = mongoose.model('Dataset', datasetSchema);

module.exports = Dataset;

