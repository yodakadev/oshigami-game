import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import { Box, Text } from '@chakra-ui/react'

// 半角数字を全角数字に変換する関数
const toFullWidth = (num: number): string => {
  return num.toString().replace(/[0-9]/g, (s) => String.fromCharCode(s.charCodeAt(0) + 0xFEE0))
}

// 10問のクイズデータ
const quizData = [
  { question: "にほんのしょうひぜいはなんパーセント？", choices: ["３パーセント", "５パーセント", "８パーセント"], answer: 0 },
  { question: "けいたいでんわのばんごうのさいしょの３ケタは？", choices: ["０３０", "０８０", "０９０"], answer: 0 },
  { question: "さいたまけんのけんちょうしょざいちは？", choices: ["さいたまし", "うらわし", "おおみやし"], answer: 1 },
  { question: "せかいでいちばんじんこうがおおいくには？", choices: ["ソれん", "インド", "ちゅうごく"], answer: 2 },
  { question: "アイドルＳＭＡＰはなんにんぐみ？", choices: ["５にん", "６にん", "７にん"], answer: 1 },
  { question: "プロやきゅうでオリックスのきゅうだんめいは？", choices: ["オリオンズ", "バファローズ", "ブレーブス"], answer: 2 },
  { question: "にほんにとどうふけんはいくつある？", choices: ["４５", "４６", "４７"], answer: 2 },
  { question: "にほんいちたかいビルはどこのとどうふけんにある？", choices: ["とうきょう", "かながわ", "おおさか"], answer: 0 },
  { question: "アニメ「ちびまるこちゃん」の\nオープニングテーマは？", choices: ["おどるポンポコリン", "ゆめいっぱい", "ねらいうち"], answer: 1 },
  { question: "１９７９ねんまで たいようけいで\nいちばんそとがわをまわるわくせいは？", choices: ["てんのうせい", "かいおうせい", "めいおうせい"], answer: 2 },
]

type GameState = 'title' | 'quiz' | 'clear'

export default function HomePage() {
  const [gameState, setGameState] = useState<GameState>('title')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [selectedChoice, setSelectedChoice] = useState(0)
  const [disabledChoices, setDisabledChoices] = useState<number[]>([])
  const [showResult, setShowResult] = useState<'correct' | 'incorrect' | null>(null)

  // BGM再生
  useEffect(() => {
    let audio: HTMLAudioElement | null = null

    if (gameState === 'quiz') {
      audio = new Audio('/sound/play.mp3')
      audio.loop = true
      audio.volume = 0.25 // 音量を30%に設定
      audio.play()
    }

    return () => {
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
    }
  }, [gameState])

  // 選択肢変更時の効果音
  useEffect(() => {
    if (gameState === 'quiz' && !showResult) {
      const audio = new Audio('/sound/select.wav')
      audio.volume = 0.5
      audio.play()
    }
  }, [selectedChoice])

  // キーボード・ゲームパッド操作
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState === 'title' && e.key === 'Enter') {
        setGameState('quiz')
        return
      }

      if (gameState === 'quiz' && !showResult) {
        if (e.key === 'ArrowUp') {
          setSelectedChoice((prev) => {
            let newChoice = prev > 0 ? prev - 1 : 2
            while (disabledChoices.includes(newChoice)) {
              newChoice = newChoice > 0 ? newChoice - 1 : 2
              if (newChoice === prev) break
            }
            return newChoice
          })
        } else if (e.key === 'ArrowDown') {
          setSelectedChoice((prev) => {
            let newChoice = prev < 2 ? prev + 1 : 0
            while (disabledChoices.includes(newChoice)) {
              newChoice = newChoice < 2 ? newChoice + 1 : 0
              if (newChoice === prev) break
            }
            return newChoice
          })
        } else if (e.key === 'Enter' || e.key === ' ') {
          if (!disabledChoices.includes(selectedChoice)) {
            handleAnswer(selectedChoice)
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameState, selectedChoice, disabledChoices, showResult])

  const handleAnswer = (choiceIndex: number) => {
    const isCorrect = choiceIndex === quizData[currentQuestion].answer

    if (isCorrect) {
      // 正解の効果音
      const audio = new Audio('/sound/maru.wav')
      audio.volume = 0.6
      audio.play()

      setShowResult('correct')
      setCorrectAnswers(correctAnswers + 1)

      // 1秒後に次の問題へ
      setTimeout(() => {
        setShowResult(null)
        if (currentQuestion < quizData.length - 1) {
          setCurrentQuestion(currentQuestion + 1)
          setSelectedChoice(0)
          setDisabledChoices([])
        } else {
          // 全問正解でクリア
          setGameState('clear')
        }
      }, 1000)
    } else {
      // 不正解の効果音
      const audio = new Audio('/sound/batu.wav')
      audio.volume = 0.6
      audio.play()

      // 不正解の場合
      setShowResult('incorrect')
      setDisabledChoices([...disabledChoices, choiceIndex])

      // 1秒後に結果表示を消す
      setTimeout(() => {
        setShowResult(null)
        // グレーアウトされていない次の選択肢に移動
        let newChoice = selectedChoice
        do {
          newChoice = (newChoice + 1) % 3
        } while (disabledChoices.includes(newChoice) || newChoice === choiceIndex)
        setSelectedChoice(newChoice)
      }, 1000)
    }
  }

  // タイトル画面
  if (gameState === 'title') {
    return (
      <React.Fragment>
        <Head>
          <title>クイズゲーム</title>
        </Head>
        <Box
          position="relative"
          width="100vw"
          height="100vh"
          overflow="hidden"
          bg="black"
        >
          <Image
            src="/images/title.png"
            alt="Title"
            fill
            style={{ objectFit: 'contain' }}
          />
        </Box>
      </React.Fragment>
    )
  }

  // クリア画面
  if (gameState === 'clear') {
    return (
      <React.Fragment>
        <Head>
          <title>クリア！</title>
        </Head>
        <Box
          position="relative"
          width="100vw"
          height="100vh"
          overflow="hidden"
          bg="black"
        >
          <Image
            src="/images/clear.png"
            alt="Clear"
            fill
            style={{ objectFit: 'contain' }}
          />
        </Box>
      </React.Fragment>
    )
  }

  // クイズ画面
  const currentQuiz = quizData[currentQuestion]
  return (
    <React.Fragment>
      <Head>
        <title>クイズゲーム - 問{currentQuestion + 1}</title>
      </Head>
      <Box
        position="relative"
        width="100vw"
        height="100vh"
        overflow="hidden"
        bg="black"
      >
        <Image
          src="/images/mondai.png"
          alt="Quiz Background"
          fill
          style={{ objectFit: 'contain' }}
        />

        {/* 左上: 問題番号表示 */}
        <Text
          position="absolute"
          top="145px"
          left="480px"
          fontSize="50px"
          color="black"
        >
          だい{toFullWidth(currentQuestion + 1)}もん
        </Text>

        {/* 右上: 正解数表示 */}
        <Text
          position="absolute"
          top="145px"
          right="480px"
          fontSize="50px"
          color="black"
        >
          せいかいすう {toFullWidth(correctAnswers)}もん
        </Text>

        {/* テキスト表示エリア */}
        <Box
          position="absolute"
          top="400px"
          left="440px"
          width="1050px"
          height="200px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={4}
          borderRadius="md"
        >
          <Text
            fontSize="50px"
            color="black"
            textAlign="start"
            whiteSpace="pre-line"
          >
            {currentQuiz.question}
          </Text>
        </Box>

        {/* 選択肢1 */}
        <Box position="absolute" top="780px" left="500px" display="flex" alignItems="center">
          {selectedChoice === 0 && !disabledChoices.includes(0) && (
            <Image
              src="/images/select.png"
              alt="Selected"
              width={24}
              height={24}
              style={{ marginRight: '10px' }}
            />
          )}
          <Text
            fontSize="40px"
            color={disabledChoices.includes(0) ? "gray" : "black"}
            ml={selectedChoice === 0 && !disabledChoices.includes(0) ? 0 : '34px'}
            opacity={disabledChoices.includes(0) ? 0.4 : 1}
          >
            １．{currentQuiz.choices[0]}
          </Text>
        </Box>

        {/* 選択肢2 */}
        <Box position="absolute" top="850px" left="500px" display="flex" alignItems="center">
          {selectedChoice === 1 && !disabledChoices.includes(1) && (
            <Image
              src="/images/select.png"
              alt="Selected"
              width={24}
              height={24}
              style={{ marginRight: '10px' }}
            />
          )}
          <Text
            fontSize="40px"
            color={disabledChoices.includes(1) ? "gray" : "black"}
            ml={selectedChoice === 1 && !disabledChoices.includes(1) ? 0 : '34px'}
            opacity={disabledChoices.includes(1) ? 0.4 : 1}
          >
            ２．{currentQuiz.choices[1]}
          </Text>
        </Box>

        {/* 選択肢3 */}
        <Box position="absolute" top="920px" left="500px" display="flex" alignItems="center">
          {selectedChoice === 2 && !disabledChoices.includes(2) && (
            <Image
              src="/images/select.png"
              alt="Selected"
              width={24}
              height={24}
              style={{ marginRight: '10px' }}
            />
          )}
          <Text
            fontSize="40px"
            color={disabledChoices.includes(2) ? "gray" : "black"}
            ml={selectedChoice === 2 && !disabledChoices.includes(2) ? 0 : '34px'}
            opacity={disabledChoices.includes(2) ? 0.4 : 1}
          >
            ３．{currentQuiz.choices[2]}
          </Text>
        </Box>

        {/* 正解・不正解の画像表示 */}
        {showResult && (
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            zIndex={10}
          >
            <Image
              src={showResult === 'correct' ? '/images/maru.png' : '/images/batu.png'}
              alt={showResult === 'correct' ? 'Correct' : 'Incorrect'}
              width={300}
              height={300}
            />
          </Box>
        )}
      </Box>
    </React.Fragment>
  )
}
