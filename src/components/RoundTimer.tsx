'use client'

import { useState, useEffect } from 'react'

interface RoundTimerProps {
  endTime: Date
  onTimeUp?: () => void
}

export function RoundTimer({ endTime, onTimeUp }: RoundTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number
    minutes: number
    seconds: number
  }>({ hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const end = endTime.getTime()
      const difference = end - now

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        setTimeLeft({ hours, minutes, seconds })
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 })
        onTimeUp?.()
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [endTime, onTimeUp])

  const isLowTime = timeLeft.hours === 0 && timeLeft.minutes < 5

  return (
    <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
      isLowTime ? 'bg-red-100 text-red-800' : 'bg-indigo-100 text-indigo-800'
    }`}>
      <div className="text-sm font-medium">Time Left:</div>
      <div className="font-mono text-lg font-bold">
        {String(timeLeft.hours).padStart(2, '0')}:
        {String(timeLeft.minutes).padStart(2, '0')}:
        {String(timeLeft.seconds).padStart(2, '0')}
      </div>
      {isLowTime && (
        <div className="animate-pulse text-red-600">⚠️</div>
      )}
    </div>
  )
}
