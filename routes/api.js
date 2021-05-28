
/*
 *
 *
 *       Complete the API routing below
 *
 *
 */
//IMPORTANT IT PASSES THE TEST ON PRICEY HUGGER PAGE; SO IT SAYS REPORTED INSTEAD OF SUCCESS
//LINK TO THE TESTS https://pricey-hugger.glitch.me/
//FINISH TO COMMENT EVERYWHERE AND CLEAN IT FROM LOGS
"use strict";
const dotenv = require("dotenv");
require("dotenv").config();
var MongoClient = require("mongodb").MongoClient;
var expect = require("chai").expect;
const CONNECTION_STRING = process.env.DB;
var ObjectId = require("mongodb").ObjectId;
module.exports = function(app) {
  MongoClient.connect(
    CONNECTION_STRING,
    { useNewUrlParser: true, useUnifiedTopology: true },
    function(err, database) {
      if (err) console.log("Database error: " + err);
      else {
        const myAwesomeDB = database.db("boards");

        /////////////////THREAD
        app
          .route("/api/threads/:board")
          .get(function(req, res) {
            var board = req.params.board;
            var threadid=req.query.thread_id;
          //console.log(threadid);
            if (threadid==null || threadid == undefined || threadid.length<24){
              myAwesomeDB
              .collection(board)
              .find({}, { projection: { replies: { $slice: 3 }, reported: 0, delete_password: 0 } })
              .sort({ bumped_on: -1 })
              .limit(10)
              .toArray(function(err, data) {
                if (err)
                  res.send(
                    "Error - impossible to retrieve threads, try again later"
                  );
                else {
                  //  data.forEach(d=>
                  //             d.replies = d.replies.slice(0,3))
                  //console.log(data);
                  res.json(data);
                }
              });
            }
            else {
              myAwesomeDB
              .collection(board)
              .find({_id: ObjectId(threadid)}, { projection: { reported: 0, delete_password:0 } })
              .toArray(function(err, data) {
                if (err)
                  res.send(
                    "Error - impossible to retrieve threads, try again later"
                  );
                else {
                  //  data.forEach(d=>
                  //             d.replies = d.replies.slice(0,3))
                  //console.log(data);
                  res.json(data[0]);
                }
              });
            }
          })
          .post(function(req, res) {
            var board = req.body.board || req.params.board;
             //console.log(req);
            var text = req.body.text;
            var pw = req.body.delete_password;
            // console.log(req.body);
           if (text !=null && pw != null){
             myAwesomeDB.collection(board).insertOne(
              {
                text: text,
                replycount:0,
                created_on: new Date(),
                bumped_on: new Date(),
                reported: false,
                delete_password: pw,
                replies: []
              },
              function(err, doc) {
                if (err) console.log(err);
                //console.log(doc.ops[0]);
                res.redirect("/b/" + board + "/");
                //res.json(doc.ops[0]);
              }
            );
           }
            else res.send("fill the form");
          })
          .put(function(req, res) {
            var board = req.params.board;
            var threadid = req.body.thread_id || req.body.report_id;
            //console.log(req.body);
            myAwesomeDB
              .collection(board)
              .findOneAndUpdate(
                { _id: ObjectId(threadid) },
                { $set: { reported: true } },
                { returnOriginal: false },
                function(err, data) {
                  if (err) console.log(err);
                  else if (data.value != null) {
                    res.send("reported");
                  } else res.send("impossible to report");
                  // console.log(data.value);
                }
              );
          })
          .delete(function(req, res) {
            var board = req.params.board;
            var threadid = req.body.thread_id || req.body.report_id;
            //console.log(req.body);
           var deletepass= req.body.delete_password
            myAwesomeDB
              .collection(board)
              .deleteOne({ _id: ObjectId(threadid), delete_password: deletepass }, function(err, data) {
              //console.log(data)  
              if (err) console.log(err);
                else {
                  if (data.deletedCount==1) {
                    res.send("success");
                  }
                  else res.send("incorrect password");
                }
              });
          });
        ///////////REPLY
        app
          .route("/api/replies/:board")
          .get(function(req, res) {
            var threadid = req.query.thread_id;
            var board = req.params.board;
            //console.log(req.query.thread_id)
            const myAwesomeDB = database.db("boards");
            
            if (threadid != null && threadid != undefined && threadid.length==24) {
              myAwesomeDB
                .collection(board)
                .find({ _id: ObjectId(threadid) }, {projection: {reported: 0, delete_password:0, "replies.delete_password":0, "replies.reported":0}}
                     )
                .toArray(function(err, data) {
                  if (err) console.log(err);
                  else {
                    var result = [];
                    // data.forEach((d)=>{
                    //   result.push(d.replies);

                    // }
                    //              )
                    // console.log(data[0]);
                    res.json(data[0]);
                  }
                });
            } else {
              res.send("");
            //  myAwesomeDB
            //    .collection(board)
            //    .find()
            //    .toArray(function(err, data) {
            //      if (err) console.log(err);
            //      else {
            //        res.send(data);
             //     }
             //   });
            }
          })
          .post(function(req, res) {
            var threadid = req.body.thread_id;
            var board = req.params.board;
            var text = req.body.text;
            var pw = req.body.delete_password;
            //console.log(req.body)
            const myAwesomeDB = database.db("boards");
            myAwesomeDB.collection(board).findOneAndUpdate(
              { _id: ObjectId(threadid) },
              {
                $push: {
                  replies: {
                    _id: ObjectId(),
                    text: text,
                    created_on: new Date(),
                    delete_password: pw,
                    reported: false
                  }
                },
                $inc: { replycount: 1 },
                $set: { bumped_on: new Date() }
              },
              { returnOriginal: false },
              function(err, data) {
                if (err) console.log(err);
                else {
                  res.redirect("/b/" + board + "/");
                  //console.log(data.value);
                }
              }
            );
          })
          .put(function(req, res) {
            var replyid = req.body.reply_id;
            //console.log(req.body);
            var threadid = req.body.thread_id;
            var board = req.params.board;
          //console.log(req);
            myAwesomeDB.collection(board).findOneAndUpdate(
              {
                _id: ObjectId(threadid),
                "replies._id": ObjectId(replyid)
              }, //funziona
              { $set: { "replies.$.reported": true } },
              { returnOriginal: false },
              function(err, data) {
                if (err) console.log(err);
                else if (data.value != null) {
                  res.send("reported");
                } else res.send("impossible to report");
                //console.log(data.value);
              }
              
            );
          })
          .delete(function(req, res) {
            var replyid = req.body.reply_id;
            var deletepass= req.body.delete_password;
            var threadid = req.body.thread_id;
            var board = req.params.board;
            console.log(req.body);
            myAwesomeDB
              .collection(board)
              .findOneAndUpdate(
                { _id: ObjectId(threadid), "replies._id": ObjectId(replyid), "replies.delete_password": deletepass },
             //   { $pull: {"replies": {"_id": ObjectId(replyid) }}, $inc: {replycount: -1} },
              {$set: { "replies.$.text": "[deleted]" }},
                { returnOriginal: false },
                function(err, data) {
                  if (err) console.log(err);
                  else {
                    if (data.value!=null) res.send("success");
                    else res.send("incorrect password");
                  };
                }
              );
          });

        //404 Not Found Middleware
        app.use(function(req, res, next) {
          res
            .status(404)
            .type("text")
            .send("Not Found");
        });
      }
    }
  );
};
