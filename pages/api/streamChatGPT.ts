const { Configuration, OpenAIApi } = require("openai");


export default async function handler(req, res) {
  const { prompt } = req.body;
  const mySecret = process.env.K_Master

  // console.log(prompt)

  const configuration = new Configuration({
    apiKey: mySecret,
  });

  const openai = new OpenAIApi(configuration);

  try {
    const res = await openai.createCompletion({
      model: "text-davinci-002",
      prompt: prompt,
      max_tokens: 2048,
      temperature: 0,
      stream: true,
    }, { responseType: 'stream' });

    res.data.on('data', data => {
      const lines = data.toString().split('\n').filter(line => line.trim() !== '');
      for (const line of lines) {
        const message = line.replace(/^data: /, '');
        if (message === '[DONE]') {
          return; // Stream finished
        }
        try {
          const parsed = JSON.parse(message);
          // console.log(parsed.choices[0].text); //log stream output
        } catch (error) {
          console.error('Could not JSON parse stream message', message, error);
        }
      }
    });
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
}