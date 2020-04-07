'use strict';
const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'myDB';
const dbCollection = 'test';
// Create a new MongoClient
const client = new MongoClient(url);

// Constants
const PORT = 80;
const HOST = '127.0.0.1';

// App
const app = express();

// Use connect method to connect to the Server
client.connect(function(err) {
  assert.equal(null, err);
  console.log("Connected successfully to server");

  const db = client.db(dbName);
  const col = db.collection(dbCollection);

  app.set('view engine', 'ejs')

  app.get('/', (req, res) => {
    // Get documents that match the query
    // col.find({}).toArray(function(err, docs) {
    //   assert.equal(null, err);
    //   res.send(JSON.stringify(docs));
    //   // client.close();
    // });
    res.render('index');
  });
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
