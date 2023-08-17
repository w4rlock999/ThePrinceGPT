const { Configuration, OpenAIApi } = require("openai");

export default async function handler(req, res) {

  // res.setHeader('Content-Type', 'text/event-stream');
  // res.setHeader('Cache-Control', 'no-cache');
  // res.writeHead(200, {
  //   'Content-Type': 'text/plain',
  //   'Transfer-Encoding': 'chunked'
  // })

  res.writeHead(200, {
    Connection: 'keep-alive',
    'Content-Encoding': 'none',
    'Cache-Control': 'no-cache',
    'Content-Type': 'text/event-stream',
  });
  const { prompt } = req.body;
  const mySecret = process.env.K_Master

  // console.log(prompt)

  const configuration = new Configuration({
    apiKey: mySecret,
  });

  const openai = new OpenAIApi(configuration);

  try {
    const response = openai.createCompletion({
      model: "text-davinci-002",
      prompt: prompt,
      max_tokens: 100,
      temperature: 0,
      stream: true,
    }, { responseType: 'stream' })

    response.then(resp => {

      resp.data.on('data', data => {
        const lines = data.toString().split('\n').filter(line => line.trim() !== '')
        for (const line of lines) {
          const message = line.replace(/^data: /, '')
          if (message === '[DONE]') {
            res.end()
            return
          }
          const parsed = JSON.parse(message)
          // const data = { response:  parsed.choices[0].text}
          // const writeData = `data: ${JSON.stringify(data)}`
          const writeData = parsed.choices[0].text
          // console.log(data)
          // console.log(writeData) //log response stream
          res.write(writeData)

        }
      })
    })

  } catch (error) {
    if (error.response?.status) {
      console.error(error.response.status, error.message);
      error.response.data.on('data', data => {
        const message = data.toString();
        try {
          const parsed = JSON.parse(message);
          console.error('An error occurred during OpenAI request: ', parsed);
        } catch (error) {
          console.error('An error occurred during OpenAI request: ', message);
        }
      });
    } else {
      console.error('An error occurred during OpenAI request', error);
    }
  }

  req.on('close', () => {
    res.end
  })

}