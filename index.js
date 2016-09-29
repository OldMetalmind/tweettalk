const PORT=8080;
var config = require('./config');
var tweetsFile = 'data/tweets.json';

var fs = require('fs');
var http = require('http');
var cron = require('node-cron');
var Twitter = require('twitter');

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

var publishTweet = function(tweet) {
  client.post('statuses/update', {status: tweet},  function(error, tweet, response) {
    if(error) throw error;
    console.log(tweet);
  });
}

function handleRequest(req, res) {
    console.log(req.url);

    if(req.url == "/start") {
      task.start();
      res.end("started");
    }
    if(req.url == "/stop") {
      task.stop();
      res.end("stopped");
    }

    if(req.url == "/restart") {
      task.stop();
      index = 0;
      task.start();
      res.end("restarted");
    }

    if(req.url == "/test") {
      testTweet(res);
      publishTweet('I Love Twitter');
      res.end("testing")
    }

    res.end("no action");
}

var server = http.createServer(handleRequest);

server.listen(PORT, function(){
    console.log("Server listening on: http://localhost:%s", PORT);
});
