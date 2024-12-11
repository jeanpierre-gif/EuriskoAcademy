const express = require('express');
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
dotenv.config();
const mongoose = require('mongoose');
const bookRoutes=require('./Books/Books.routes');
const authorRoutes = require('./Authors/Authors.routes');
const memberRoutes = require('./Members/Members.routes');
const app = express();
const logMiddleware = require('./Middlewares/LogMiddleware'); 
app.use(logMiddleware); 
app.use(bodyParser.json());
const port = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_DB_CONNECTION);
const db = mongoose.connection;

app.use('/api/books',bookRoutes);
app.use('/api/Authors',authorRoutes);
app.use('/api/members',memberRoutes );
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
