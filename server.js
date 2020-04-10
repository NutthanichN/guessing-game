'use strict';
const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const ejs = require('ejs');
const bodyParser = require('body-parser');
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
app.set('view engine', 'ejs');
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({extended: true}));

// Use connect method to connect to the Server
client.connect(function(err) {
  assert.equal(null, err);
  console.log("Connected successfully to server");

  const db = client.db(dbName);
  const col = db.collection(dbCollection);

  app.get('/', (req, res) => {
    
    col.findOne({state: 1}, function(err, doc) {
      assert.equal(null, err);
      // if there's col_game
      if (doc !== null) {
        console.log("Found document.")
        // change page part
        switch (doc.step) {
          case 0:
            // renderAnswerPage(res, doc, "Test");
            renderQuestionPage(res, doc, "first");
            break;
          case 1:
            renderQuestionPage(res, doc, "second");
            break;
          case 2:
            renderQuestionPage(res, doc, "third");
            break;
          case 3:
            renderQuestionPage(res, doc, "last");
            break;
          case 4:
            renderAnswerPage(res, doc, "first");
            break;
          case 5:
            renderAnswerPage(res, doc, "second");
            break;
          case 6:
            renderAnswerPage(res, doc, "third");
            break;
          case 7:
            renderAnswerPage(res, doc, "last");
            break;
          default:
            // game over + show score + retry button
            renderScorePage(res, doc);
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
        };
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
      console.log(req.body);

      if (req.body.questioning) {
        var choose = req.body.questioning;
        col.updateOne({state: 1, question: "_"}, {$set: {'question.$': choose}, $inc: {step: 1}}, 
          function(err, r) {
            assert.equal(null, err);
            // assert.equal(1, r.upsertedCount);
            console.log("Update question");
        });
        // console.log("Submit question");
        // console.log(req.body.questioning);
      }

      if (req.body.answering) {
        console.log("Submit answer");
        console.log(req.body.answering);
      }

      res.redirect("/");
  });

  function renderAnswerPage(res, doc, charOrder) {
    res.render('index', {
      modeStr: "guess",
      charOrder: charOrder,
      question: null, 
      guessing: doc.guessing.join(" "), 
      answer: "<insert answers here>",
      // answer: doc.answer.join(" "), 
      miss: doc.fail.toString(),
      startButton: false
    });
  }

  function renderQuestionPage(res, doc, charOrder) {
    res.render('index', {
      modeStr: "add",
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
      modeStr: null,
      charOrder: null,
      question: null,
      guessing: null, 
      answer: null, 
      miss: null,
      startButton: true
    });
  }

  function renderScorePage(res, doc) {
    res.render('score', {
      score: 0
    });
  }

});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
