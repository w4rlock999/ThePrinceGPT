"use client"
import type { NextPage } from 'next'
import Head from 'next/head'
import { useState, useEffect, useRef } from 'react'
import styles from '../styles/Home.module.css'
import { useRouter } from "next/router"
import Database from '@replit/database'

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

  // const client = new Database();
  // client.set("key1", "this is from REPLIT DB");
  // client.set("key2", "this is from REPLIT DB");
  // client.set("key3", "this is from REPLIT DB").then(() => {    
  //   client.list().then(keys => {console.log(keys)})
  // });

  // let key = client.get("key");
  // client.list().then(keys => {
  //   console.log(keys)
  // })

  // client.getAll().then((allPairs) => {
  //   console.log(allPairs)
  // })

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
  const [chapterTitle, setChapterTitle] = useState("")
  const [paragraphsText, setParagraphsText] = useState([])
  const initialChat = "Welcome to The Prince GPT! Delve into Niccolò Machiavelli's brilliant insights paragraph by paragraph. Simply click on any paragraph, and our AI will provide you with a detailed explanation, helping you digest the book's profound teachings better. Grab your coffee, tune your music playlist and enjoy the journey through this timeless classic like never before! Happy reading!"
  const [chatsState, setChatsState] = useState({ chatsArray: [initialChat] })
  const [followUpState, setFollowUpState] = useState({ followUpArray: [] })
  const [selectedParagraph, setSelectedParagraph] = useState('')
  const [generating, setGenerating] = useState(false)
  const [displayExplanation, setDisplayExplanation] = useState(true)
  // const [currentChapter, setCurrentChapter] = useState(1)
  const currentChapter = useRef(1)
  const bookPaneRef = useRef(null)
  const router = useRouter()
  const promptResponseList = useRef([])
  const promptRequestList = useRef([])

  useEffect(() => {
    // Execute code whenever the router object changes
    // For example, you can update your component state or perform any necessary actions

    const { chapter } = router.query
    const chapterFromURL = chapter

    if (chapterFromURL > 0) {
      currentChapter.current = chapterFromURL
    }

    setSelectedParagraph('')

    fetch('/api/fetchChapter', {
      method: 'POST',
      body: JSON.stringify({ chapter: currentChapter.current }),
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then((response) => response.json())
      .then((data) => {
        setChapterTitle(data.title);
        setParagraphsText(data.paragraphs);
      })

    bookPaneRef.current.scrollTop = 0

  }, [router]);

  useEffect(() => {
    if (!generating && chatsState.chatsArray.length > 1) {
      console.log("finished generating!")
      const prompt = "I have the following paragraph: "
      prompt += chatsState.chatsArray[chatsState.chatsArray.length - 1]
      prompt += "\n from it, give 3 follow up topics, no more and no less than 3 topics, straight to the points, without intro, without numbering, minimum 7 words and maximum 15 words each, each topic separated with mandatory semicolon as in this format examples: (Machiavelli's legacy;Alexander The Great politics;How Germany doomed on world war 2) (Examples of greed that destroy a company;Fraud and scam in the startup world;More on why leader should wary of being hated), \n\n topics should be about relevancies with historical event, or real historical business case, or real war history, or real historical politics, or section in The Prince, and if the paragraph mentions an example, please give a follow up topic to deep dive into it."

      getGPTFollowUp(prompt)
    }
  }, [generating])

  // useEffect(() => {
  //   // console.log(followUpState)
  // }, [followUpState])

  const getParagraphClassName = (thisParagraphId) => {

    if (selectedParagraph === thisParagraphId)
      return styles.chapterParagraphSelected;
    else
      return styles.chapterParagraph;
  };

  const getGPTResponse = async (prompt) => {

    setGenerating(true)
    const promptToSend = { prompt: prompt }

    //Append the prompt into promptRequestList
    promptRequestList.current.push(prompt)
    //Append the response into promptResponseList
    if (chatsState.chatsArray.length > 1) {
      promptResponseList.current.push(chatsState.chatsArray[chatsState.chatsArray.length - 1])
    }

    // Initialize an empty array to store the Messages
    var messages = [];

    // Iterate through the arrays and append questions and answers to Messages
    for (var i = 0; i < promptResponseList.current.length; i++) {
      var userMessage = { "role": "user", "content": promptRequestList.current[i] };
      var assistantMessage = { "role": "assistant", "content": promptResponseList.current[i] };

      messages.push(userMessage);
      messages.push(assistantMessage);
    }

    //Push the latest request
    var userMessage = { "role": "user", "content": promptRequestList.current[promptRequestList.current.length - 1] };
    messages.push(userMessage)

    const messagesToSend = { messages: messages }
    console.log(messagesToSend)

    try {
      let response = await fetch('/api/streamChatGPT_SDKV4', {
        method: 'POST',
        body: JSON.stringify(messagesToSend),
        headers: {
          'Content-Type': 'application/json',
        }
      })
      console.log("HTTP POST sent")

      if (response.ok) {
        console.log("response is OK")
        const bufferArray = [...chatsState.chatsArray]
        bufferArray.push("")
        const reader = response.body.getReader()

        const processStream = async () => {
          while (true) {
            const { done, value } = await reader.read()

            if (done) {
              setGenerating(false)
              console.log("break from streaming while loop")
              break
            }

            let chunk = new TextDecoder('utf-8').decode(value)

            bufferArray[bufferArray.length - 1] += chunk
            setChatsState({ ...chatsState, chatsArray: bufferArray })
          }
        }
        //call processStream()s
        await processStream()
          .catch(err => console.log('--stream error--', err))
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  const getGPTFollowUp = async (prompt) => {

    var messages = []
    var initialMessage = { "role": "user", "content": "You are a book reader assistant, you will give 3 follow up topics of a paragraph, with this example formatting: ```Julius Caesar politics in ptolemic egypt;Alexander The Great fragile politics;How Adolf Hitler's war was a certain loss``` for starter, please give example of follow up topic of a paragraph in The Prince, with that format, each topic MUST ended with semicolon (;) and without white space" };
    var initialResponse = { "role": "assistant", "content": "Challenges of Ruling Hereditary States;Strategies for Consolidating New States;Historical Instances of Power Regained" };
    var userMessage = { "role": "user", "content": prompt };


    messages.push(initialMessage)
    messages.push(initialResponse)
    messages.push(userMessage)
    const messagesToSend = { messages: messages }

    try {
      let response = await fetch('/api/streamChatGPT_SDKV4', {
        method: 'POST',
        body: JSON.stringify(messagesToSend),
        headers: {
          'Content-Type': 'application/json',
        }
      })
      console.log("HTTP POST sent")

      if (response.ok) {
        console.log("response is OK")

        var buffer = ""
        const reader = response.body.getReader()

        const processStream = async () => {
          while (true) {
            const { done, value } = await reader.read()

            if (done) {
              break
            }

            let chunk = new TextDecoder('utf-8').decode(value)
            buffer += chunk
          }
          console.log(buffer)
          var bufferArray = buffer.split(";").filter((splittedString) => {
            return splittedString != ""
          })
          setFollowUpState({ ...followUpState, followUpArray: bufferArray })
        }
        await processStream()
          .catch(err => console.log('--stream error--', err))
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  const chapterParagraphOnClickHandler = async (clickedParagraphIndex) => {
    // clear the follow up question
    setFollowUpState({ ...followUpState, followUpArray: [] })

    console.log("paragraph clicked!", clickedParagraphIndex)
    setSelectedParagraph(clickedParagraphIndex)
    setDisplayExplanation(true)

    // fetch chatGPT response
    var prompt = "explain this paragraph around 50 words, straight to the explanation without intro or retelling my request, use an academic writing style, if there is any relevancies with other part of The Prince do mention it a bit in the closing, if the paragraph borrow ideas or describing a historical figure please explain a bit about him/her/them"

    prompt += paragraphsText[clickedParagraphIndex]
    await getGPTResponse(prompt)
  }

  const prevButtonOnClickHandler = () => {
    if (currentChapter.current != 1) {
      let newChapter: number = parseInt(currentChapter.current, 10)
      newChapter -= 1
      router.push(`/?chapter=${newChapter}`)
    }
  }
  const nextButtonOnClickHandler = () => {
    if (currentChapter.current != 26) {
      let newChapter: number = parseInt(currentChapter.current, 10)
      newChapter += 1
      router.push(`/?chapter=${newChapter}`)
    }
  }

  const screenOverlayOnClickHandler = () => {
    setDisplayExplanation(false)
  }

  const followUpButtonOnClickHandler = async (followUp) => {
    // clear the follow up question
    setFollowUpState({ ...followUpState, followUpArray: [] })

    var prompt = "still related with the previous questions, please explain more about: "
    prompt += followUp
    prompt += " in less than 50 words, academic style, factual, educational, slips in some fun fact / trivia sneakily"
    await getGPTResponse(prompt)
  }

  return (
    <div className={styles.readingContainer} >
      <div ref={bookPaneRef} className={styles.bookPane}>
        <div className={styles.bookPaneFadeDivContainer}>
          <div className={styles.bookPaneFadeDiv}></div>
        </div>
        <div className={styles.nextPrevButtonContainer}>
          <button className={styles.prevButton} onClick={prevButtonOnClickHandler}>
            <ion-icon name="caret-back-outline"></ion-icon>
          </button>
          <button className={styles.nextButton} onClick={nextButtonOnClickHandler}>
            <ion-icon name="caret-forward-outline"></ion-icon>
          </button>
        </div>
        <h2 className={styles.bookChapter}>
          Chapter {currentChapter.current}
          <div className={styles.bookChapterLine}>
          </div>
        </h2>

        <h2 className={styles.bookChapterTitle}>
          {chapterTitle}
        </h2>
        <div className={styles.bookChapterText}>
          {paragraphsText.map((paragraph, index) => (
            <p
              key={index}
              className={getParagraphClassName(index)}
              onClick={() => chapterParagraphOnClickHandler(index)}
            >
              {paragraph.trim()}
            </p>
          ))}
        </div>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
      </div>
      {window.innerWidth <= 768 && displayExplanation &&
        <div className={styles.explanationOverlayContainer}>
          <div className={styles.explanationOverlayTopScreen} onClick={screenOverlayOnClickHandler}></div>
          <div className={styles.explanationOverlay}>
            <p className={styles.explanationOverlayDescP}>
              Paragraph Explanation
            </p>
            <div className={styles.explanationOverlayPLine}>
            </div>
            <p className={styles.explanationOverlayP}>
              {chatsState.chatsArray[chatsState.chatsArray.length - 1]}
            </p>
            <div className={styles.explanationOverlayPLineBottom}>
            </div>

          </div>
        </div>
      }

      {window.innerWidth > 768 &&
        <div className={styles.chatPane}>

          {chatsState.chatsArray.map((chat, index) => (
            <div className={styles.chatContainer}>
              <div className={styles.chatBotAvatar}>AI</div>
              <p id="chat" className={styles.chatBotP}>{chat}</p>
            </div>
          )
          )}
          {followUpState.followUpArray.map((followUp, index) => (
            <div className={styles.followUpContainer}>
              <button className={styles.followUpButton} onClick={() => followUpButtonOnClickHandler(followUp)} >
                {followUp}
              </button>
            </div>
          )
          )}
          <br></br>
          <br></br>
          <br></br>
          <br></br>

        </div>
      }
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
        <meta name="theme-color" content="#610F2D" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Layout></Layout>

      </main>
    </div>
  )
}

export default Home
