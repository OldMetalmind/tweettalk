const PORT=8080;
var config = require('./config');
var tweetsFile = 'data/tweets.json';

var fs = require('fs');
var cron = require('node-cron');
var Twitter = require('twitter');

var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");

var app = express();
app.use(bodyParser.json());


// TWITTER CONFIG
var index = 0;
var tweets = JSON.parse(
    fs.readFileSync(tweetsFile)
);

var client = new Twitter({
  consumer_key: config.twitter.consumer_key,
  consumer_secret: config.twitter.consumer_secret,
  access_token_key: config.twitter.access_token_key,
  access_token_secret: config.twitter.access_token_secret
});

var task = cron.schedule('*/1 * * * *', function() {
  if( index < tweets.length )
  {
    publishTweet(tweets[index]);
    index++;
  }
}, false);

// FUNCTIONS

var publishTweet = function(tweet) {
  client.post('statuses/update', {status: tweet},  function(error, tweet, response) {
    if(error) throw error;
    console.log(tweet);
  });
}

// API CALLS

function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

app.get("/start", function(req, res) {
  task.start();
  console.log("started");
  res.status(200);
});

app.get("/stop", function(req, res) {
  task.stop();
  console.log("stopped");
  res.status(200);
});

app.get("/restart", function(req, res) {
  task.stop();
  index = 0;
  task.start();
  console.log("restarted");
  res.status(200);
});

app.get("/test", function(req, res) {
  publishTweet('I Love Twitter');
  res.status(200);
});

var server = app.listen(process.env.PORT || 8080, function () {
   var port = server.address().port;
   console.log("App now running on port", port);
});
