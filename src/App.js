import React, { useState, useCallback } from 'react'
import TopRight from './components/TopRight'
import InfiniteGrid from './components/InfiniteGrid'
import { posters, posterImages } from './postersData'
import { NoiseOverlay } from './components/NoiseOverlay'
import './styles.css'

export const colors = {
  green: '#00FF46',
  blue: '#0075FF',
  orange: '#FF7F00',
  yellow: '#FFFF00',
  chartreuse: '#B5FF00',
  pink: '#FF00C4',
  darkback: '#192817',
}

const PosterButton = ({ backgroundColor, hoverColor, text }) => (
  <div
    className="poster-button"
    style={{
      '--bg': colors[backgroundColor] || backgroundColor,
      '--hover-bg': colors[hoverColor] || hoverColor,
    }}
  >
    <p style={{ transform: 'scaleY(2.4) scale(.666)' }}>{text}</p>
  </div>
)

const formatPosterNumber = (number) => {
  return number.toString().padStart(3, '0').slice(-3)
}

export default function App() {
  const [currentPoster, setCurrentPoster] = useState(posters[0])

  const handlePosterChange = useCallback((poster) => {
    setCurrentPoster(poster)
  }, [])

  return (
    <>
      <TopRight />
      <InfiniteGrid
        posters={posters}
        posterImages={posterImages}
        onPosterChange={handlePosterChange}
      />
      <PosterButton
        backgroundColor={currentPoster.backgroundColor}
        hoverColor={currentPoster.hoverColor}
        text={`Poster ${formatPosterNumber(currentPoster.id)}`}
      />
      <NoiseOverlay />
    </>
  )
}
