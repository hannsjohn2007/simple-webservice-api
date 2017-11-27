"use strict";
let express = require('express');
let app = express();
let bodyParser = require('body-parser');
var cors = require('cors')
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let router = express.Router();

let CryptAPI = require('./webservice-api/routes/CryptAPI');

let crypt = new CryptAPI(router);

app.use('/api', cors(), crypt.router);

app.listen(3000, () => {
  console.log('Crypt web service is running in localhost:3000');
});


