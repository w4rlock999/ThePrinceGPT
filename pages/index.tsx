"use client"
import type { NextPage } from 'next'
import Head from 'next/head'
import { useState, useEffect } from 'react'
import styles from '../styles/Home.module.css'
import { useRouter } from "next/router"

function TextLogo(props) {

  const textLogoOnClickHandler = () => {
    props.setReadMode(false)
  }

  return (
    <div style={{ cursor: 'pointer' }} className={styles.textLogo} onClick={textLogoOnClickHandler}>
      THE
      PRINCE
      GPT
    </div>
  )
}

function SideBar(props) {

  const router = useRouter();
  const chapters = [];

  const handleNavButtonClick = (index) => {
    router.push(`/?chapter=${index + 1}`)
      .then(() => {
        props.setReadMode(true)
      });
  };

  for (let i = 1; i <= 26; i++) {
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
        1532, Niccolò Machiavelli
      </h2>
      <div className={styles.titleLine}>
      </div>
      <br></br>
      <p>
        The Prince <b>(Italian: Il Principe)</b> a 16th-century political treatise written by Italian diplomat and political theorist Niccolò Machiavelli as an instruction guide for new princes and royals.
      </p>
      <p>
        <b>ThePrinceGPT</b> aims to make this masterpiece <b>digestable</b> to everyone with the power of OpenAI’s Large Language Model
      </p>
    </div>
  )
}

function LandingMode(props) {

  const startReadingOnClickHandler = () => {
    props.setReadMode(true)
  }

  return (
    <div>
      <div className={styles.imgFrameDiv}>
        <img className={styles.theImage} src='machiavelli.png'></img>
      </div>
      <div className={styles.imgFadeDiv}>
      </div>
      <LandingText />
      <button className={styles.readButton} onClick={startReadingOnClickHandler}>
        Start reading
      </button>
    </div>
  )
}

function ReadMode() {
  const [text, setText] = useState([])
  const [resultText, setResultText] = useState("Welcome to The Prince GPT! Delve into Niccolò Machiavelli's brilliant insights paragraph by paragraph. Simply click on any paragraph, and our AI will provide you with a detailed explanation, helping you digest the book's profound teachings better. Grab your coffee, tune your music playlist and enjoy the journey through this timeless classic like never before! \n\n Happy reading!")
  const initialChat = "Welcome to The Prince GPT! Delve into Niccolò Machiavelli's brilliant insights paragraph by paragraph. Simply click on any paragraph, and our AI will provide you with a detailed explanation, helping you digest the book's profound teachings better. Grab your coffee, tune your music playlist and enjoy the journey through this timeless classic like never before! \n\n Happy reading!"
  const [chatsState, setChatsState] = useState({ chatsArray: [initialChat] })
  const [selectedParagraph, setSelectedParagraph] = useState('')
  const [generating, setGenerating] = useState(false)
  const router = useRouter()
  let currentChapter = 1

  useEffect(() => {
    // Execute code whenever the router object changes
    // For example, you can update your component state or perform any necessary actions
    const { chapter } = router.query
    const chapterFromURL = chapter

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
        // this is new implem using array state ======================
        //============================================================
        
        const bufferArray = [...chatsState.chatsArray]
        bufferArray.push("")
        const reader = response.body.getReader()

        const processStream = async () => {
          while (true) {
            const { done, value } = await reader.read()
            if (done) {
              setGenerating(false)
              break
            }
            let chunk = new TextDecoder('utf-8').decode(value)
            chunk = chunk.replace(/^data: /, '')
            // setResultText((prev) => prev + chunk)
            bufferArray[bufferArray.length - 1] += chunk
            setChatsState({...chatsState, chatsArray:bufferArray})
          }
        }
        processStream().catch(err => console.log('--stream error--', err))
        
        //============================================================
        // setResultText("")
        // const reader = response.body.getReader()

        // const processStream = async () => {
        //   while (true) {
        //     const { done, value } = await reader.read()
        //     if (done) {
        //       setGenerating(false)
        //       break
        //     }
        //     let chunk = new TextDecoder('utf-8').decode(value)
        //     chunk = chunk.replace(/^data: /, '')
        //     setResultText((prev) => prev + chunk)
        //   }
        // }
        // processStream().catch(err => console.log('--stream error--', err))
      }
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

        {chatsState.chatsArray.map((chat, index) => (
          <div className={styles.chatContainer}>
            <div className={styles.chatBotAvatar}>AI</div>
            <p id="chat" className={styles.chatBotP}>{chat}</p>
          </div>
          )
        )}
        
        {/* <div className={styles.chatContainer}>
          <div className={styles.chatBotAvatar}>AI</div>
          <p id="resultText" className={styles.chatBotP}>{resultText}</p>
        </div> */}


        {/* <div className={styles.chatContainer}>
          <div className={styles.chatUserAvatar}>o</div>
          <p id="resultText" className={styles.chatUserP}>{resultText}</p>
        </div> */}
        {/* <div className={styles.chatContainer}>
          <div className={styles.chatBotAvatar}>AI</div>
          <div className={styles.chatBubble}>

            <p id="resultText" className={styles.chatBotP}>{resultText}</p>
          </div>
        </div> */}

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

  return (
    <div>
      <div className={styles.mainPage}>
        <SideBar setReadMode={setReadMode} />
        <TextLogo setReadMode={setReadMode} />
        {!readMode &&
          <LandingMode setReadMode={setReadMode} />
        }
        {readMode && <ReadMode />}

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
        <title>The Prince GPT</title>
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
