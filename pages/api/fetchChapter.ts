const fs = require("fs")
const cheerio = require("cheerio")

export default function handler(req, res) {
  const filePath = 'public/theprince.html'
  const html = fs.readFileSync(filePath, 'utf-8')
  const { chapter } = req.body

  // using cheerio to scrap theprince.html
  const $ = cheerio.load(html)
  const targetElement = $(`[id=chap${chapter > 9 ? '' : '0'}${chapter}]`) //get element with id=chapXX, with 0 if < 9 
  const chapterDiv = targetElement.parentsUntil('div').parent()
  const chapterTitleElement = chapterDiv.find('h2')
  const chapterTitle = chapterTitleElement.contents().filter(
                        function() {
                          return $(this).prev().is('br')
                        }).text().trim()
  const paragraphsElements = chapterDiv.find('p')

  const chapterObject = {
    title: "",
    paragraphs: []
  }

  chapterObject.title = chapterTitle
  paragraphsElements.each((index, element) => {
    const paragraphText = $(element).text()
    chapterObject.paragraphs.push(paragraphText)
  })
  res.status(200).json(chapterObject)
}