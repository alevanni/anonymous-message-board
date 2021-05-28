/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *       (if additional are added, keep them at the very end!)
 */
//AGGIUSTA IL MODO IN CUI SI PRENDONO LE PASSWORD
var chaiHttp = require("chai-http");
var chai = require("chai");
var assert = chai.assert;
var server = require("../server");
var ObjectId = require("mongodb").ObjectId;
chai.use(chaiHttp);

suite("Functional Tests", function() {
  var myId;
  var myId2;
  var myId3;
  var myReplyId;
  var myReplyId2;
  suite("API ROUTING FOR /api/threads/:board", function() {
    var myPass = "password"; //così funziona ma non è molto pulito

    suite("POST", function() {
      ///DO IT TWICE; ONE FOR DELETE, ONE FOR PUT AND REPLIES!
      test("Test POST /api/threads/:board with text and password", function(done) {
        chai
          .request(server)
          .post("/api/threads/test")
          .send({ text: "This is a test", delete_password: "password" })
          .end(function(req, res) {
            assert.equal(res.status, 200);

            done();
          });
      });
    });
    ///////////////////////////////////////////////////////////////////////
    suite("GET", function() {
      test("Test GET /api/threads/:board with board title", function(done) {
        chai
          .request(server)
          .get("/api/threads/test") //.send({text: "thread", delete_password: "password"})
          .end(function(req, res) {
            //console.log(res.status);
            assert.equal(res.status, 200);
            assert.isAtMost(res.body.length, 10);

            res.body.forEach(d => {
              assert.property(d, "text");
              assert.property(d, "created_on");
              assert.property(d, "bumped_on");
              assert.property(d, "replycount");
              assert.notProperty(d, "reported");
              assert.notProperty(d, "delete_password");
              assert.property(d, "replies");
              assert.isArray(d.replies);
              assert.isAtMost(d.replies.length, 3);

              // assert.equal(d.replies.length, d.replycount);
            });
            myId = res.body[0]._id;
            myId2 = res.body[1]._id;
            // myPass = res.body[0].delete_password; //LA PW NON C?é PIU
            //console.log(myId2);
            done();
          });
      });
      test("Test GET /api/threads/:board with board title and thread id", function(done) {
        chai
          .request(server)
          .get("/api/threads/test?thread_id=" + myId)
          .end(function(req, res) {
            assert.equal(res.status, 200);
            assert.property(res.body, "replies");
            assert.property(res.body, "_id");
            assert.property(res.body, "text");
            assert.property(res.body, "created_on");
            assert.property(res.body, "bumped_on");
            assert.notProperty(res.body, "reported");
            assert.notProperty(res.body, "delete_password");
            assert.equal(res.body.replies.length, res.body.replycount);
            done();
          });
      });
    });
    ////////////////////////////////////////////////////////////////////
    suite("DELETE", function() {
      test("Test DELETE /api/threads/:board", function(done) {
        chai
          .request(server)
          .delete("/api/threads/test")
          .send({ thread_id: myId, delete_password: myPass })
          .end(function(req, res) {
            assert.equal(res.status, 200);
            //console.log(res)
            assert.equal(res.text, "success");
            done();
          });
      });
    });
    ////////////////////////////////////////////////////////////////////
    suite("PUT", function() {
      test("Test PUT api/threads/:board with thread id", function(done) {
        chai
          .request(server)
          .put("/api/threads/test")
          .send({ thread_id: myId2 })
          .end(function(req, res) {
            //console.log()
            assert.equal(res.status, 200);
            assert.equal(res.text, "reported");
            done();
          });
      });
    });
  });
  //////////////////////////////////////////////////////////////
  //                       ROUTING
  //////////////////////////////////////////////////////////////
  suite("API ROUTING FOR /api/replies/:board", function() {
    suite("POST", function() {
      test("Test POST /api/replies/:board with id, text and password", function(done) {
        chai
          .request(server)
          .post("/api/replies/test")
          .send({
            thread_id: myId2,
            text: "test reply",
            delete_password: "pass"
          })
          .end(function(req, res) {
            assert.equal(res.status, 200);

            done();
          });
      });

      ////
    });
    /////////////////////////////////////////////////////////////
    suite("GET", function() {
      test("Test /api/replies/:board with board titel and thread id", function(done) {
        chai
          .request(server)
          .get("/api/replies/test?thread_id=" + myId2)
          .end(function(req, res) {
            assert.equal(res.status, 200);
            assert.property(res.body, "_id");
            assert.property(res.body, "text");
            assert.property(res.body, "created_on");
            assert.property(res.body, "replies");
            assert.notProperty(res.body, "reported");
            assert.notProperty(res.body, "delete_password");
           
            assert.equal(res.body.replies.length, res.body.replycount);
            res.body.replies.forEach( d => {
              assert.notProperty(d, "reported");
            assert.notProperty(d, "delete_password");
            })
           myId3=res.body._id;
            myReplyId=res.body.replies[0]._id;
            done();
          });
      });
    });
    //////////////////////////////////////////////////////////////
    suite("PUT", function() {
      test("Test PUT /api/replies/:board with id", function(done){
        chai.request(server).put("/api/replies/test").send({thread_id: myId3, reply_id: myReplyId})
        .end(function(req, res){
          assert.equal(res.status, 200);
          //console.log(myReplyId)
          //console.log(myId3)
          assert.equal(res.text, "reported");
          console.log(res.text)
          done();
        })
      })
    });
    //////////////////////////////////////////////////////////////
    suite("DELETE", function() {
      test("Test DELETE /api/replies/:board with id and correct password", function(done) {
        chai.request(server).delete("/api/replies/test").send({thread_id: myId2, reply_id: myReplyId, delete_password: "pass"})
        .end(function(req, res){
          assert.equal(res.status, 200); 
          assert.equal(res.text, "success");
        done();
      })
      });
      
       test("Test DELETE /api/replies/:board with id and incorrect password", function(done) {
        chai.request(server).delete("/api/replies/test").send({thread_id: myId2, reply_id: myReplyId, delete_password: "incorrect"})
        .end(function(req, res){
          assert.equal(res.status, 200); 
          assert.equal(res.text, "incorrect password");
        done();
      })
      });
      ///////////////
    });
    
    /////////////////
  });
});
