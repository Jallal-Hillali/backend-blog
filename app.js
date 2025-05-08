const express = require('express');
const connectToDb = require('./config/connectToDb');
require('dotenv').config();
const authRoute = require('./routes/authRoute')


// Connection To db
connectToDb();

// Init App 
const app = express();

// Middlewares

app.use(express.json());

// Routes
app.use('/api/auth', authRoute);

// Running the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => 
    console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`
    )
);