import { useState, useEffect } from 'react'
import './App.css'
import rabbitImg from './assets/rabbit.png'
import timerSound from './assets/timer.mp3'
import laugh1 from './assets/laugh1.mp3'
import laugh2 from './assets/laugh2.mp3'
import laugh3 from './assets/laugh3.mp3'

function App() {
  const targetDate = new Date('2026-06-05T14:00:00+06:00')

  const calculateTimeLeft = () => {
    const difference = +targetDate - +new Date()
    let timeLeft = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    }

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      }
    }

    return timeLeft
  }

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())
  const [started, setStarted] = useState(false)

  const [rabbits] = useState(() =>
      [...Array(20)].map(() => ({
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * -20}s`,
        duration: `${15 + Math.random() * 15}s`,
      }))
  )

  // Timer ticks regardless of audio state
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Audio starts only after the user taps the overlay (guaranteed gesture)
  useEffect(() => {
    if (!started) return

    const laughSounds = [laugh1, laugh2, laugh3]
    let laughIndex = 0
    let laughTimeout: ReturnType<typeof setTimeout>
    let currentLaugh: HTMLAudioElement | null = null

    const audio = new Audio(timerSound)
    audio.loop = true

    const playNextLaugh = () => {
      if (currentLaugh) {
        currentLaugh.pause()
        currentLaugh.onended = null
      }

      const nextLaugh = new Audio(laughSounds[laughIndex])
      currentLaugh = nextLaugh

      nextLaugh.play().catch(error => {
        console.log("Laugh playback failed:", error)
      })

      nextLaugh.onended = () => {
        laughIndex = (laughIndex + 1) % laughSounds.length
        laughTimeout = setTimeout(playNextLaugh, 3000)
      }
    }

    audio.play().then(() => {
      playNextLaugh()
    }).catch(error => {
      console.log("Audio play blocked by browser:", error)
    })

    return () => {
      audio.pause()
      if (currentLaugh) {
        currentLaugh.pause()
        currentLaugh.onended = null
      }
      clearTimeout(laughTimeout)
    }
  }, [started])

  const formatNumber = (num: number) => String(num).padStart(2, '0')

  return (
      <main className="countdown-container">
        {!started && (
            <div
                className="start-overlay"
                onClick={() => setStarted(true)}
                style={{
                  position: 'fixed',
                  inset: 0,
                  zIndex: 1000,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0, 0, 0, 1)',
                  color: '#fff',
                  fontSize: '2rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  padding: '1rem',
                }}
            >
              НАЖМИ МЕНЯ
            </div>
        )}

        <div className="background-rabbits">
          {rabbits.map((rabbit, i) => (
              <img
                  key={i}
                  src={rabbitImg}
                  className="rabbit"
                  style={{
                    top: rabbit.top,
                    left: rabbit.left,
                    animationDelay: rabbit.delay,
                    animationDuration: rabbit.duration,
                  }}
                  alt=""
              />
          ))}
        </div>
        <h1 className="title">ДО СОБЕСЕДОВАНИЯ</h1>
        <div className="timer">
          <div className="time-block">
            <span className="time-value">{timeLeft.days}</span>
            <span className="time-label">дней</span>
          </div>
          <div className="time-block">
            <span className="time-value">{formatNumber(timeLeft.hours)}</span>
            <span className="time-label">часов</span>
          </div>
          <div className="time-block">
            <span className="time-value">{formatNumber(timeLeft.minutes)}</span>
            <span className="time-label">минут</span>
          </div>
          <div className="time-block">
            <span className="time-value">{formatNumber(timeLeft.seconds)}</span>
            <span className="time-label">секунд</span>
          </div>
        </div>
        <div className="bottom-text">кто прочитал тот лох</div>
      </main>
  )
}

export default App