import OpenAI from 'openai';
import Database from '@replit/database';

export default async function handler(req, res) {

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  const database = new Database();

  console.log("user IP address: " + ip);

  var curUserStat = await database.get(ip)
  console.log(curUserStat)
  if (curUserStat == null) {
    console.log("current user is null")
    database.set(ip, { time: "now", totalReq: 1 })
  } else {
    console.log("current user is " + ip)
    var curTotalReq = curUserStat.totalReq += 1
    database.set(ip, { time: "now", totalReq: curTotalReq })
    console.log("total request " + curUserStat.totalReq)
  }

  res.writeHead(200, {
    Connection: 'keep-alive',
    'Content-Encoding': 'none',
    'Cache-Control': 'no-cache',
    'Content-Type': 'text/event-stream',
  });

  const { messages } = req.body;
  const mySecret = process.env.K_Master
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