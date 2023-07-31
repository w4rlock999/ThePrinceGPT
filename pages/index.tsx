"use client"
import type { NextPage } from 'next'
import Head from 'next/head'
import { useState, useEffect } from 'react'
import styles from '../styles/Home.module.css'
import { useChat } from "ai/react"
import { useRouter } from "next/router"

function TextLogo() {
  return (
    <div className={styles.textLogo}>
      THE
      PRINCE
      GPT
    </div>
  )
}

function SideBar() {

  const router = useRouter();

  const handleNavButtonClick = (index) => {
    router.push(`/?chapter=${index + 1}`);
  };

  const chapters = [];

  const romanNumerals = [
    '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
    'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX',
    'XXI', 'XXII', 'XXIII', 'XXIV', 'XXV', 'XXVI'
  ];

  for (let i = 1; i <= 26; i++) {
    // chapters.push(`Chapter ${romanNumerals[i]}`);
    chapters.push(`Chapter ${i}`);
  }

  return (
    <div className={styles.sideBar}>
      <div className={styles.sideBarNavContainer}>
        <ul className={styles.sideBarUl}>
          {chapters.map((item, index) => (
            <li className={styles.sideBarLi}
              onClick={() => handleNavButtonClick(index)}
              style={{ cursor: 'pointer' }}
            >
              {item}
            </li>
          ))}
        </ul>

      </div>
      <div className={styles.arrowIcon}>
        <span class="icon"><ion-icon name="caret-forward-outline"></ion-icon></span>
      </div>
    </div>
  )
}

function LandingText() {
  return (
    <div className={styles.landingTextComponent}>
      <h1 className={styles.titleText} style={{ margin: 0 }}>
        The Prince
      </h1>
      <h2 className={styles.subTitleText}>
        1532, Machiavelli
      </h2>
      <div className={styles.titleLine}>
      </div>
      <br></br>
      <p>
        The Prince <b>(Italian: Il Principe)</b> a 16th-century political treatise written by Italian diplomat and political theorist Niccolò Machiavelli as an instruction guide for new princes and royals.
      </p>
      <p>
        <b>ThePrinceGPT</b> aims to make this masterpiece <b>digestable</b> to everyone with the power of ChatGPT’s Large Language Model
      </p>
    </div>
  )
}

function LandingMode() {

  return (
    <div>
      <div className={styles.imgFrameDiv}>
        <img className={styles.theImage} src='machiavelli.png'></img>
      </div>
      <div className={styles.imgFadeDiv}>
      </div>
      <LandingText />
    </div>
  )
}

function ReadMode() {
  const [text, setText] = useState([])
  const [resultText, setResultText] = useState('Lorem ipsum dolor sit amet Lorem ipsum dolor sit amet Lorem ipsum dolor sit amet Lorem ipsum dolor sit ametLorem ipsum dolor sit ametLorem ipsum dolor sit amet Lorem ipsum dolor sit amet Lorem ipsum dolor sit ametLorem ipsum dolor sit ametLorem ipsum dolor sit amet Lorem ipsum dolor sit amet Lorem ipsum dolor sit ametLorem ipsum dolor sit ametLorem ipsum dolor sit amet Lorem ipsum dolor sit amet Lorem ipsum dolor sit ametLorem ipsum dolor sit ametLorem ipsum dolor sit amet Lorem ipsum dolor sit amet Lorem ipsum dolor sit ametLorem ipsum dolor sit ametLorem ipsum dolor sit amet Lorem ipsum dolor sit amet Lorem ipsum dolor sit ametLorem ipsum dolor sit ametLorem ipsum dolor sit amet Lorem ipsum dolor sit amet Lorem ipsum dolor sit ametLorem ipsum dolor sit ametLorem ipsum dolor sit amet Lorem ipsum dolor sit amet Lorem ipsum dolor sit ametLorem ipsum dolor sit ametLorem ipsum dolor sit amet Lorem ipsum dolor sit amet Lorem ipsum dolor sit ametLorem ipsum dolor sit ametLorem ipsum dolor sit amet Lorem ipsum dolor sit amet')
  const [selectedParagraph, setSelectedParagraph] = useState('')
  const [generating, setGenerating] = useState(false)
  const router = useRouter()

  const { messages, input, handleInputChange, handleSubmit } = useChat
  let currentChapter = 1

  useEffect(() => {
    const queryString = window.location.search; // "?name=John&age=25"
    const urlParams = new URLSearchParams(queryString);

    const { chapter } = router.query
    const chapterFromURL = chapter
    // const chapterFromURL = urlParams.get('chapter');

    if (chapterFromURL > 0) {
      currentChapter = chapterFromURL
    }

    fetch('/api/fetchChapter', {
      method: 'POST',
      body: JSON.stringify({ chapter: currentChapter }),
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then((response) => response.json())
      .then((data) => {
        setText(data.paragraphs);
      })
  }, []);

  useEffect(() => {
    // Execute code whenever the router object changes
    // For example, you can update your component state or perform any necessary actions
    console.log('Router object changed:', router);
    const { chapter } = router.query
    const chapterFromURL = chapter
    // const chapterFromURL = urlParams.get('chapter');

    // if (chapterFromURL == currentChapter) {
    //   return
    // }

    if (chapterFromURL > 0) {
      currentChapter = chapterFromURL
    }

    setSelectedParagraph('')

    fetch('/api/fetchChapter', {
      method: 'POST',
      body: JSON.stringify({ chapter: currentChapter }),
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then((response) => response.json())
      .then((data) => {
        setText(data.paragraphs);
      })
  }, [router]);

  const getParagraphClassName = (thisParagraphId) => {

    if (selectedParagraph === thisParagraphId)
      return styles.chapterParagraphSelected;
    else
      return styles.chapterParagraph;
  };

  const getGPTResponse = async (prompt) => {

    setGenerating(true)
    const promptToSend = { prompt: prompt }
    try {
      let response = await fetch('/api/streamChatGPT2', {
        method: 'POST',
        body: JSON.stringify(promptToSend),
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        setResultText("")
        const reader = response.body.getReader()

        const processStream = async () => {
          while (true) {
            const { done, value } = await reader.read()

            if (done) {
              // console.log("stream done!")
              setGenerating(false)
              break
            }

            let chunk = new TextDecoder('utf-8').decode(value)

            chunk = chunk.replace(/^data: /, '')
            // console.log("this is chunk " + chunk)
            // const parsed = JSON.parse(chunk)
            // const parsed = chunk
            // console.log(parsed)

            setResultText((prev) => prev + chunk)
            // setResultText((prev) => prev + parsed)
          }
        }
        processStream().catch(err => console.log('--stream error--', err))
      }

      // const data = await response.json(); ////for fetch instead of stream
      // return data.answer; ////for fetch instead of stream
    } catch (error) {
      console.error("Error:", error);
    }
  }

  const chapterParagraphOnClickHandler = async (clickedParagraphIndex) => {


    console.log("paragraph clicked!", clickedParagraphIndex)
    setSelectedParagraph(clickedParagraphIndex)

    // fetch chatGPT response
    const prompt = "explain this The Prince excerpt around 50 words: "
    prompt += text[clickedParagraphIndex]
    const responseString = await getGPTResponse(prompt)
    // setResultText(responseString) //for fetch instead of stream
    // console.log("Response in the frontend " + responseString)
  }

  return (
    <div className={styles.readingContainer} >
      <div className={styles.bookPane}>
        <div className={styles.bookText}>
          {text.map((paragraph, index) => (
            <p
              key={index}
              className={getParagraphClassName(index)}
              onClick={() => chapterParagraphOnClickHandler(index)}
            >
              {paragraph.trim()}
            </p>
          ))}
        </div>
      </div>
      <div className={styles.chatPane}>

        <div className={styles.chatContainer}>
          <div className={styles.chatBotAvatar}>AI</div>
          <div className={styles.chatBubble}>
            {/* <p id="resultText" class="whitespace-pre-line"></p> */}
            <p id="resultText" className={styles.chatBotP}>{resultText}</p>
          </div>

        </div>

        {/* <div className={styles.chatBubble}>
          <div className={styles.chatUserAvatar}></div>
          <p className={styles.chatUserP}>
            Who is Machiavelli?
          </p>
        </div>
        <div className={styles.chatQuestionContainer}>
          <button className={styles.chatQuestionButton}>
          </button>
          <button className={styles.chatQuestionButton}>
          </button>
          <button className={styles.chatQuestionButton}>
          </button>          
        </div> */}

      </div>
    </div>
  )
}

function Layout() {
  const [readMode, setReadMode] = useState(false)

  const toggleReadMode = () => {
    setReadMode(!readMode)
  }

  return (
    <div>
      <div className={styles.mainPage}>
        <SideBar />
        <div className={styles.imgFadeDiv}>
        </div>
        <TextLogo />
        <button className={styles.readButton} onClick={toggleReadMode}>
          Start reading
        </button>

        {readMode && <LandingMode />}
        {!readMode && <ReadMode />}

      </div>
      <script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"></script>
      <script nomodule src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js"></script>
    </div>
  )
}


const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Layout></Layout>

      </main>
    </div>
  )
}

export default Home
