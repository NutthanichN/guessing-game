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
app.use(bodyParser.json());
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
      if (doc !== null) {
        // change page part
        switch (doc.step) {
          case 0:
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
            console.log("Game ends");
            let duration = doc.gameStop - doc.gameStart;
            let durationSec = duration / 1000;
            let score = (4 * 1000)-(durationSec * 100)-(doc.fail * 100);
            score = Math.round(score);
            // let durationText = new Date(duration);
            
            let history = doc.score;
            history = history.map(function(value, index){
              return value["score"];
            });
            history.push(score);
            history.sort(function(a, b) {return b - a});
            history = history.slice(0, 5);
            res.render('score', {
              start: doc.gameStart,
              end: doc.gameStop,
              miss: doc.fail,
              durationSec: durationSec,
              durationText: null,
              score: score,
              top_5: history.join(" > ")
            });

            let gameOverUpdate = {
              $push: {
                score: {
                  $each: [{
                    score: score,
                    fail: doc.fail,
                    duration_sec: durationSec,
                    date: new Date()
                  }],
                  $sort: {score: -1},
                  $slice: 5
                }
              },
              $set: {
                question: ["_","_","_","_"],
                guessing: ["*","*","*","*"],
                answer: [],
                fail: 0,
                step: 0,
                gameStart: null,
                gameStop: null
              }
            }

            col.updateOne({state: 1}, gameOverUpdate, function(err, r){
              assert.equal(null, err);
              assert.equal(1, r.matchedCount);
              assert.equal(1, r.modifiedCount);
            });
        }
      }
      else {
        var newGameDoc = {
          state: 1,
          question: ["_", "_", "_", "_"],
          guessing: ["*", "*", "*", "*"],
          answer: [],
          score: [],
          fail: 0,
          step: 0,
          gameStart: null,
          gameStop: null
        };
        col.insertOne(newGameDoc, function(err, r) {
          assert.equal(null, err);
          assert.equal(1, r.insertedCount);
          console.log("Inserted new document")
        });
        renderStartPage(res);
      }
    });
  });

  app.post('/', (req, res) => {
      if (req.body.questioning) {
        var choose = req.body.questioning;
        var questionUpdate = {
          $set: {'question.$': choose}, 
          $inc: {step: 1}
        };
        col.updateOne({state: 1, question: "_"}, questionUpdate, function(err, r) {
          assert.equal(null, err);
          assert.equal(1, r.matchedCount);
          assert.equal(1, r.modifiedCount);
        });
      }

      if (req.body.answering) {
        var choose = req.body.answering;
        col.findOne({state: 1}, function(err, doc) {
          assert.equal(null, err);
          var index = doc.step - 4;
          // success case
          if (doc.question[index] === choose) {
            var updatedDoc = {
              $push: {answer: choose}, 
              $pop: {guessing: 1},
              $inc: {step: 1}
            };
          }
          // fail case
          else {
            var updatedDoc = {
              $inc: {fail: 1}
            };
          }

          // record date
          if (index === 0 && doc.fail === 0) {
            updatedDoc["$set"] = {gameStart: new Date()};
          }
          else if (index === 3) {
            updatedDoc["$set"] = {gameStop: new Date()};
          }

          // console.log(updatedDoc);
          col.updateOne({state: 1}, updatedDoc, function(err, r) {
            assert.equal(null, err);
            assert.equal(1, r.matchedCount);
            assert.equal(1, r.modifiedCount);
          });
        });
      }
      res.redirect("/");
  });

  function renderAnswerPage(res, doc, charOrder) {
    res.render('index', {
      modeStr: "guess",
      charOrder: charOrder,
      question: null, 
      guessing: doc.guessing.join(" "), 
      answer: doc.answer.join(" "), 
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
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
