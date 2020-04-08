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
    // Get documents that match the query
    // col.find({}).toArray(function(err, docs) {
    //   assert.equal(null, err);
    //   // res.send(JSON.stringify(docs));
    //   // client.close();
    // });

    col.findOne({state: 1}, (err, doc) => {
      assert.equal(null, err);
      // getDBVariable(doc);
      var state = doc.state;
      var question = doc.question;
      var question = question.join(" ");
      var guessing = doc.guessing;
      var guessing = doc.guessing;
      var guessing = guessing.join(" ");
      var answer = doc.answer;
      var score = doc.score;
      var fail = doc.fail;
      var step = doc.step;
      // console.log(doc.question);
      // console.log(doc.answer);
      // console.log(doc.guessing);

      // res.send(JSON.stringify(doc));
      // client.close();
      res.render('index', {
        question: question, guessing: guessing, 
        answer: answer, fail: fail
      });

    });
  });

//   app.post('/', (req, res) => {
//       // post request -> update database and render
//   });

});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
