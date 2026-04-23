const express = require('express');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const dogsRouter = require('./routes/dogs');

const app = express();

app.use((req, res, next) => {
  req.requestId = uuidv4();
  res.setHeader("X-Request-Id", req.requestId);
  next();
});

app.use('/', dogsRouter); // Do not remove this line

const server =	app.listen(3000, () => console.log("Server listening on port 3000"));
module.exports = server;