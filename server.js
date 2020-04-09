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
    
    col.findOne({state: 1}, function(err, doc) {
      assert.equal(null, err);
      // if there's col_game
      if (doc !== null) {
        console.log("Found document.")
        // change page part
        switch (doc.step) {
          case 0:
            renderSetQuestionPage(res, doc, "first");
            break;
          case 1:
            renderSetQuestionPage(res, doc, "second");
            break;
          case 2:
            renderSetQuestionPage(res, doc, "third");
            break;
          case 3:
            renderSetQuestionPage(res, doc, "last");
            break;
          case 4:
          case 5:
          case 6:
          case 7:
          default:
            renderAnswerPage(res, doc, "");
        }
        
      }
      else {
        // else: insert + refresh (using start button)
        var newGameDoc = {
          state: 1,
          question: ["_", "_", "_", "_"],
          guessing: ["*", "*", "*", "*"],
          answer: [],
          score: 0,
          fail: 0,
          step: 0,
          gameStart: null,
          gameStop: null
        }
        col.insertOne(newGameDoc, function(err, r) {
          assert.equal(null, err);
          assert.equal(1, r.insertedCount);
          console.log("Insert new document.")
        });
        renderStartPage(res);
      }
    });

  });

  app.post('/', (req, res) => {
      // submit question / answer part
  });

  function renderAnswerPage(res, doc, charOrder) {
    res.render('index', {
      mode: "guess",
      charOrder: charOrder,
      question: doc.question.join(" "), 
      guessing: doc.guessing.join(" "), 
      answer: doc.answer.join(" "), 
      miss: doc.fail.toString(),
      startButton: false
    });
  }

  function renderSetQuestionPage(res, doc, charOrder) {
    res.render('index', {
      mode: "select",
      charOrder: charOrder,
      question: doc.question.join(" "), 
      guessing: null, 
      answer: null, 
      miss: null,
      startButton: false
    });
  }

  function renderStartPage(res) {
    res.render('index', {
      mode: null,
      charOrder: null,
      question: null,
      question: null, 
      guessing: null, 
      answer: null, 
      miss: null,
      startButton: true
    });
  }

});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
