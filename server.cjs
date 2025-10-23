const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 9080;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// API 엔드포인트들
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/bus/arrival/:stationId', async (req, res) => {
  const dummyData = {
    success: true,
    data: [
      { routeName: '220', arrivalTime1: Math.floor(Math.random() * 15) + 1 },
      { routeName: '221', arrivalTime1: Math.floor(Math.random() * 12) + 2 }
    ]
  };
  res.json(dummyData);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
