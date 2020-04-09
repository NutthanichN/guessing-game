'use strict';
const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const ejs = require('ejs');
// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'guessingGameDB';
const dbCollection = 'games';
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
    
    // if there's col_game
    col.findOne({state: 1}, (err, doc) => {
      assert.equal(null, err);
      // console.log(doc);
      if (doc !== null) {
        // change page part
        renderIndex(res, doc, "first");
      }
      else {
        // else: insert + refresh (using start button)
        console.log("No document.")
        res.send("No required document.")
      }
    });

  });

  app.post('/', (req, res) => {
      // submit question / answer part
  });

  function renderIndex(res, doc, charOrder) {
    res.render('index', {
      charOrder: charOrder,
      question: doc.question.join(" "), 
      guessing: doc.guessing.join(" "), 
      answer: doc.answer, 
      fail: doc.fail
    });
  }

});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
