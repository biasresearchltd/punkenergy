import React, { useEffect, useRef } from 'react'

const FRAME_COUNT = 20

export const NoiseOverlay = () => {
  const greyCanvasRef = useRef(null)
  const darkCanvasRef = useRef(null)

  useEffect(() => {
    const greyCanvas = greyCanvasRef.current
    const darkCanvas = darkCanvasRef.current
    let width = window.innerWidth
    let height = window.innerHeight
    const greyCtx = greyCanvas.getContext('2d')
    const darkCtx = darkCanvas.getContext('2d')
    let frames = []
    let timer

    const generateFrames = () => {
      frames = []
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

        frames.push({ grey: greyData, dark: darkData })
      }
    }

    const loop = () => {
      const idx = Math.floor(Math.random() * FRAME_COUNT)
      greyCtx.putImageData(frames[idx].grey, 0, 0)
      darkCtx.putImageData(frames[idx].dark, 0, 0)
      timer = setTimeout(loop, 50 + Math.random() * 30)
    }

    const init = () => {
      greyCanvas.width = width
      greyCanvas.height = height
      darkCanvas.width = width
      darkCanvas.height = height
      generateFrames()
      greyCtx.putImageData(frames[0].grey, 0, 0)
      darkCtx.putImageData(frames[0].dark, 0, 0)
      timer = setTimeout(loop, 60)
    }

    init()

    const handleResize = () => {
      clearTimeout(timer)
      width = window.innerWidth
      height = window.innerHeight
      init()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(timer)
    }
  }, [])

  return (
    <>
      <canvas
        ref={greyCanvasRef}
        id="grey-noise"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 8,
          pointerEvents: 'none',
          opacity: 0.12,
          transform: 'translateZ(0)',
          mixBlendMode: 'screen',
        }}
      />
      <canvas
        ref={darkCanvasRef}
        id="dark-noise"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          pointerEvents: 'none',
          opacity: 0.3,
          transform: 'translateZ(0)',
          mixBlendMode: 'overlay',
        }}
      />
    </>
  )
}
