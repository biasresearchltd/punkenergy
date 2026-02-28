import React, { useState, useCallback, useEffect, useRef } from 'react'
import TopRight from './components/TopRight'
import InfiniteGrid from './components/InfiniteGrid'
import { posters, posterImages } from './postersData'
import { NoiseOverlay } from './components/NoiseOverlay'
import { CSSGrainOverlay } from './components/CSSGrainOverlay'
import './styles.css'

// Grain mode: 'canvas' (original) | 'css' (pre-baked PNG, zero JS)
const GRAIN_MODE = 'css'

export const colors = {
  green: '#00FF46',
  blue: '#0075FF',
  orange: '#FF7F00',
  yellow: '#FFFF00',
  chartreuse: '#B5FF00',
  pink: '#FF00C4',
  darkback: '#192817',
}

const PosterButton = ({ backgroundColor, hoverColor, text, onClick }) => (
  <div
    className="poster-button"
    style={{
      '--bg': colors[backgroundColor] || backgroundColor,
      '--hover-bg': colors[hoverColor] || hoverColor,
    }}
    onClick={onClick}
  >
    <p style={{ transform: 'scaleY(2.4) scale(.666)' }}>{text}</p>
  </div>
)

const formatPosterNumber = (number) => {
  return number.toString().padStart(3, '0').slice(-3)
}

export default function App() {
  const [currentPoster, setCurrentPoster] = useState(posters[0])
  const [blurbOpen, setBlurbOpen] = useState(false)
  const pillRef = useRef(null)
  const panelRef = useRef(null)

  const handlePosterChange = useCallback((poster) => {
    setCurrentPoster(poster)
    setBlurbOpen(false)
  }, [])

  useEffect(() => {
    if (!blurbOpen) return
    function handleClickOutside(e) {
      if (pillRef.current && pillRef.current.contains(e.target)) return
      if (panelRef.current && panelRef.current.contains(e.target)) return
      setBlurbOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [blurbOpen])

  return (
    <>
      <TopRight />
      <InfiniteGrid
        posters={posters}
        posterImages={posterImages}
        onPosterChange={handlePosterChange}
      />
      <div ref={pillRef}>
        <PosterButton
          backgroundColor={currentPoster.backgroundColor}
          hoverColor={currentPoster.hoverColor}
          text={`Poster ${formatPosterNumber(currentPoster.id)}`}
          onClick={() => setBlurbOpen(prev => !prev)}
        />
      </div>
      <div
        ref={panelRef}
        className={`blurb-panel${blurbOpen ? ' blurb-panel--open' : ''}`}
        style={{ '--bg': colors[currentPoster.backgroundColor] || currentPoster.backgroundColor }}
      >
        <p>{currentPoster.blurb || 'No description yet.'}</p>
      </div>
      {GRAIN_MODE === 'canvas' && <NoiseOverlay />}
      {GRAIN_MODE === 'css' && <CSSGrainOverlay />}
    </>
  )
}
