const express = require('express');
const fs = require('fs').promises;
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;
const dataFile = './data.json';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files (e.g., logo images)

// Initialize data.json if it doesn't exist
async function initializeDataFile() {
    try {
        await fs.access(dataFile);
    } catch (error) {
        await fs.writeFile(dataFile, JSON.stringify([]));
    }
}

// Load data from data.json
async function loadData() {
    try {
        const rawData = await fs.readFile(dataFile, 'utf8');
        return JSON.parse(rawData);
    } catch (error) {
        console.error('Error reading data.json:', error);
        return [];
    }
}

// Save data to data.json
async function saveData(data) {
    try {
        await fs.writeFile(dataFile, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error writing to data.json:', error);
    }
}

// GET endpoint to retrieve all data
app.get('/api/data', async (req, res) => {
    const data = await loadData();
    res.json(data);
});

// POST endpoint to add or update data
app.post('/api/data', async (req, res) => {
    const newData = req.body;
    let data = await loadData();

    // Check if data for this nosis exists
    const existingIndex = data.findIndex(item => item.nosis === newData.nosis);
    if (existingIndex >= 0) {
        // Update existing record
        data[existingIndex] = { ...data[existingIndex], ...newData };
    } else {
        // Add new record
        data.push(newData);
    }

    await saveData(data);
    res.json({ message: 'Data saved successfully', data });
});

// Start server
initializeDataFile().then(() => {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
});