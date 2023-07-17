const fs = require("fs")
const cheerio = require("cheerio")

export default function handler(req, res) {
  const filePath = 'public/theprince.html'
  const html = fs.readFileSync(filePath, 'utf-8')
  const { chapter } = req.body
  
  const $ = cheerio.load(html)
  const targetElement = $(`[id=chap${chapter > 9 ? '' : '0'}${chapter}]`)
  const chapterDiv = targetElement.parentsUntil('div').parent()
  const paragraphsElement = chapterDiv.find('p')

  // console.log(paragraphs.text()) 
  const paragraphsObject = {
    paragraphs: []
  }
    
  paragraphsElement.each((index, element) => {
    const paragraphText = $(element).text()
    paragraphsObject.paragraphs.push(paragraphText)
  })
  // paragraphsObject.paragraphs.push("hello")
  // console.log(paragraphsObject)
  res.status(200).json(paragraphsObject)
}