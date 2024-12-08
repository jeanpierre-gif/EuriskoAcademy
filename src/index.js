const express = require('express');
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
dotenv.config();
const mongoose = require('mongoose');
const bookRoutes=require('./Books/Books.routes');
const app = express();
app.use(bodyParser.json());
const port = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_DB_CONNECTION);
const db = mongoose.connection;

app.use('/api/books',bookRoutes);
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
