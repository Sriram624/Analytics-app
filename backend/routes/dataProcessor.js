const Papa = require('papaparse'); // npm install papaparse

const parseCsv = (csvString) => {
    return new Promise((resolve, reject) => {
        Papa.parse(csvString, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true, // Attempt to convert numbers/booleans
            complete: (results) => {
                if (results.errors.length) {
                    return reject(results.errors);
                }
                resolve({
                    data: results.data,
                    headers: results.meta.fields
                });
            },
            error: (err) => reject(err)
        });
    });
};

const aggregateData = (data, dimension, metric) => {
    // Basic aggregation example: count by dimension
    const aggregated = {};
    data.forEach(row => {
        const key = row[dimension];
        if (key) {
            aggregated[key] = (aggregated[key] || 0) + 1;
        }
    });
    return Object.keys(aggregated).map(key => ({
        _id: key,
        count: aggregated[key]
    }));
};

module.exports = { parseCsv, aggregateData };