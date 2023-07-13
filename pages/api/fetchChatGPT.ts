const { Configuration, OpenAIApi } = require("openai");

export default async function handler(req, res) {


  const { prompt } = req.body;
  console.log(prompt)

  const configuration = new Configuration({
    apiKey: "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",
  });

  const openai = new OpenAIApi(configuration);

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
    //stream: true,
    // max_tokens: 2048,
    // n: 1,
    // stop: null,
  });


  console.log("answer in the fetchChatGPT.ts: ", response.data.choices[0].message.content)
  res.status(200).json({ answer: response.data.choices[0].message.content })
}


 // const reader = await response.data.getReader()
  // if (!reader) {
  //   console.error("Error: fail to read data from response");
  //   return;
  // }
  // const decoder = new TextDecoder("utf-8")
  // var responseText = ""

  // while (true) {
  //   const { done, value } = await reader.read()
  //   if (done) {
  //     break;
  //   }
  //   const chunk = decoder.decode(value)
  //   const lines = chunk.split("\\n")
  //   const parsedLines = lines
  //     .map((line) => line.replace(/^data: /, "").trim()) // Remove the "data: " prefix
  //     .filter((line) => line !== "" && line !== "[DONE]") // Remove empty lines and "[DONE]"
  //     .map((line) => JSON.parse(line)); // Parse the JSON string

  //   for (const parsedLine of parsedLines) {
  //     const { choices } = parsedLine
  //     const { delta } = choices[0]
  //     const { content } = delta

  //     if (content) {
  //       responseText += content
  //       console.log(responseText)
  //       // resultText.innerText += content
  //     }
  //   }
  // }