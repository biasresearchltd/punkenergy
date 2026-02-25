import React, { useEffect, useRef } from 'react'

export const NoiseOverlay = () => {
  const greyCanvasRef = useRef(null)
  const darkCanvasRef = useRef(null)

  useEffect(() => {
    const greyCanvas = greyCanvasRef.current
    const darkCanvas = darkCanvasRef.current
    // Cap DPI scaling at 2 for performance
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let width = Math.round(window.innerWidth * dpr)
    let height = Math.round(window.innerHeight * dpr)
    const greyCtx = greyCanvas.getContext('2d')
    const darkCtx = darkCanvas.getContext('2d')
    let noiseFrames = []
    let rafId
    let lastTime = 0
    const baseInterval = 50
    let nextInterval = baseInterval
    const FRAME_COUNT = 30

    const generateFrames = () => {
      noiseFrames = []
      for (let f = 0; f < FRAME_COUNT; f++) {
        const greyData = greyCtx.createImageData(width, height)
        const darkData = darkCtx.createImageData(width, height)
        const greyBuf = new Uint32Array(greyData.data.buffer)
        const darkBuf = new Uint32Array(darkData.data.buffer)
        const len = greyBuf.length

        for (let i = 0; i < len; i++) {
          if (Math.random() < 0.5) {
            greyBuf[i] = 0xffffffff
          } else {
            darkBuf[i] = 0xff000000
          }
        }

        noiseFrames.push({ grey: greyData, dark: darkData })
      }
    }

    const loop = (timestamp) => {
      rafId = requestAnimationFrame(loop)

      if (timestamp - lastTime < nextInterval) return
      lastTime = timestamp
      nextInterval = baseInterval + Math.random() * 30 - 15

      // Random frame selection — no sequential pattern to detect
      const idx = (Math.random() * FRAME_COUNT) | 0
      greyCtx.putImageData(noiseFrames[idx].grey, 0, 0)
      darkCtx.putImageData(noiseFrames[idx].dark, 0, 0)
    }

    const init = () => {
      greyCanvas.width = width
      greyCanvas.height = height
      darkCanvas.width = width
      darkCanvas.height = height
      generateFrames()
      rafId = requestAnimationFrame(loop)
    }

    init()

    const handleResize = () => {
      cancelAnimationFrame(rafId)
      const newDpr = Math.min(window.devicePixelRatio || 1, 2)
      width = Math.round(window.innerWidth * newDpr)
      height = Math.round(window.innerHeight * newDpr)
      greyCanvas.width = width
      greyCanvas.height = height
      darkCanvas.width = width
      darkCanvas.height = height
      generateFrames()
      rafId = requestAnimationFrame(loop)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <>
      <canvas
        ref={greyCanvasRef}
        id="grey-noise"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '100vw',
          zIndex: 8,
          pointerEvents: 'none',
          opacity: 0.12,
          transform: 'translateZ(0)',
          mixBlendMode: 'screen',
          filter: 'blur(.2px)',
        }}
      />
      <canvas
        ref={darkCanvasRef}
        id="dark-noise"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '100vw',
          zIndex: 9999,
          pointerEvents: 'none',
          opacity: 0.3,
          transform: 'translateZ(0)',
          mixBlendMode: 'overlay',
          filter: 'blur(.3px)',
        }}
      />
    </>
  )
}
