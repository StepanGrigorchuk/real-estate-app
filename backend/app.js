const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const propertiesRouter = require('./routes/properties');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/realestate', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use('/api/properties', propertiesRouter);

app.listen(3000, () => {
  console.log('Backend API running on http://localhost:3000');
});