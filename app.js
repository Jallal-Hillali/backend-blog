const express = require('express');
const connectToDb = require('./config/connectToDb');
require('dotenv').config();
const authRoute = require('./routes/authRoute');
const { errorHandler, notFound } = require('./middlewares/error');

// Connection To db
connectToDb();

// Init App 
const app = express();

// Middlewares

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoute'));
app.use('/api/users', require('./routes/usersRoute'));
app.use('/api/posts', require('./routes/postsRoute'));
app.use('/api/comments', require('./routes/commentsRoute'));
app.use('/api/categories', require('./routes/categoriesRoute'));

// Error Handler Middleware
app.use(notFound);
app.use(errorHandler);

// Running the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => 
    console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`
    )
);