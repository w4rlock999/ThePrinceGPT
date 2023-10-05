import OpenAI from 'openai';

export default async function handler(req, res) {

  res.writeHead(200, {
    Connection: 'keep-alive',
    'Content-Encoding': 'none',
    'Cache-Control': 'no-cache',
    'Content-Type': 'text/event-stream',
  });

  const { messages } = req.body;
  const mySecret = process.env.API_KEY
  const openai = new OpenAI({
    apiKey: mySecret,
  });

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      stream: true,
      temperature: 0.2,
      top_p: 0.2
    });

    for await (const part of stream) {
      const message = part.choices[0].delta
      if (Object.keys(message).length === 0) {
        res.end()
        return
      }
      res.write(message.content)
    }

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