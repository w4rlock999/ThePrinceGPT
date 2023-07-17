const { Configuration, OpenAIApi } = require("openai");

export default async function handler(req, res) {

  var sendAndSleep = function(response, counter) {
    if (counter > 10) {
      response.end();
    } else {
      response.write(" ;i=" + counter);
      console.log(counter)
      counter++;
      setTimeout(function() {
        sendAndSleep(response, counter);
      }, 1000)
    };
  };

  // res.setHeader('Content-Type', 'text/event-stream');
  // res.setHeader('Content-Type', 'text/html; charset=utf-8');
  // res.setHeader('Cache-Control', 'no-cache');
  // res.writeHead(200, {
  //   'Content-Type': 'text/html; charset=utf-8',
  //   'Transfer-Encoding': 'chunked'
  // })
  res.writeHead(200, {
    Connection: 'keep-alive',
    'Content-Encoding': 'none',
    'Cache-Control': 'no-cache',
    'Content-Type': 'text/event-stream',
  });
  res.write("Thinking...");
  sendAndSleep(res, 1);
}


