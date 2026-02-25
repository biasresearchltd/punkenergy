import React, { useRef, useEffect, useCallback } from 'react'

function mod(n, m) {
  return ((n % m) + m) % m
}

// Poster aspect ratio (width / height) — all posters are 3:4
const POSTER_ASPECT = 3 / 4

// Tile pool: 7 columns x 5 rows = 35 tiles — large buffer for fast scrolling
const TILE_COLS = 7
const TILE_ROWS = 5
const TILE_COUNT = TILE_COLS * TILE_ROWS

export default function InfiniteGrid({ posters, posterImages, onPosterChange }) {
  const containerRef = useRef(null)
  const moverRef = useRef(null)
  const tileEls = useRef([])

  // Continuous pixel offsets in refs (no re-render per pixel)
  const offsetRef = useRef({ x: 0, y: 0 })
  const velocityRef = useRef({ x: 0, y: 0 })
  const targetRef = useRef({ x: 0, y: 0 })

  // Animation state
  const animFrameRef = useRef(null)
  const isAnimatingRef = useRef(false)

  // Wheel debounce
  const wheelTimeoutRef = useRef(null)
  const wheelMagnetTimeoutRef = useRef(null)

  // Touch state
  const touchLastRef = useRef({ x: 0, y: 0 })
  const touchTimeRef = useRef(0)
  const isTouchingRef = useRef(false)

  // Wheel active state
  const wheelActiveRef = useRef(false)

  // Mouse drag state
  const isDraggingRef = useRef(false)
  const dragLastRef = useRef({ x: 0, y: 0 })
  const dragTimeRef = useRef(0)

  // Last known center cell — to avoid redundant tile updates
  const lastCenterRef = useRef({ row: 0, col: 0 })

  // Last reported poster id — to avoid redundant onPosterChange calls
  const lastPosterIdRef = useRef(null)

  // Viewport and cell dimensions
  const viewportRef = useRef({
    vw: typeof window !== 'undefined' ? window.innerWidth : 1000,
    vh: typeof window !== 'undefined' ? window.innerHeight : 1000,
    cellW: typeof window !== 'undefined' ? window.innerHeight * POSTER_ASPECT : 750,
  })

  // Imperatively update tile positions and images — synchronous, no React render
  const updateTiles = useCallback(() => {
    const { cellW, vh } = viewportRef.current
    const centerRow = Math.round(offsetRef.current.y / vh)
    const centerCol = Math.round(offsetRef.current.x / cellW)

    // Skip if center hasn't changed
    if (centerRow === lastCenterRef.current.row && centerCol === lastCenterRef.current.col) return
    lastCenterRef.current = { row: centerRow, col: centerCol }

    const halfC = Math.floor(TILE_COLS / 2)
    const halfR = Math.floor(TILE_ROWS / 2)
    let i = 0

    for (let dr = -halfR; dr <= halfR; dr++) {
      for (let dc = -halfC; dc <= halfC; dc++) {
        const row = centerRow + dr
        const col = centerCol + dc
        const idx = mod(row + col, posters.length)
        const el = tileEls.current[i]
        if (el) {
          el.style.left = `${col * cellW}px`
          el.style.top = `${row * vh}px`
          el.style.width = `${cellW}px`
          el.style.backgroundImage = `url(${posterImages[posters[idx].id]})`
        }
        i++
      }
    }
  }, [posters, posterImages])

  const updateTransform = useCallback(() => {
    if (moverRef.current) {
      const { x, y } = offsetRef.current
      const { vw, cellW } = viewportRef.current
      const centerOffsetX = (vw - cellW) / 2
      moverRef.current.style.transform = `translate3d(${-x + centerOffsetX}px, ${-y}px, 0)`
    }
  }, [])

  const reportCurrentPoster = useCallback(() => {
    const { cellW, vh } = viewportRef.current
    const row = Math.round(offsetRef.current.y / vh)
    const col = Math.round(offsetRef.current.x / cellW)
    const idx = mod(row + col, posters.length)
    const posterId = posters[idx].id
    if (posterId !== lastPosterIdRef.current) {
      lastPosterIdRef.current = posterId
      onPosterChange(posters[idx])
    }
  }, [posters, onPosterChange])

  const updateGrid = useCallback(() => {
    updateTransform()
    updateTiles()
    reportCurrentPoster()
  }, [updateTransform, updateTiles, reportCurrentPoster])

  const cancelAnimation = useCallback(() => {
    isAnimatingRef.current = false
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
  }, [])

  // Unified spring animation
  const startSpring = useCallback(() => {
    const friction = 0.96
    const threshold = 0.3
    const maxVel = 30

    function springFrame() {
      if (!isAnimatingRef.current) return

      const { cellW, vh } = viewportRef.current

      velocityRef.current.x = Math.max(-maxVel, Math.min(maxVel, velocityRef.current.x)) * friction
      velocityRef.current.y = Math.max(-maxVel, Math.min(maxVel, velocityRef.current.y)) * friction

      offsetRef.current.x += velocityRef.current.x
      offsetRef.current.y += velocityRef.current.y

      if (wheelActiveRef.current) {
        updateGrid()
        animFrameRef.current = requestAnimationFrame(springFrame)
        return
      }

      const speed = Math.sqrt(
        velocityRef.current.x * velocityRef.current.x +
        velocityRef.current.y * velocityRef.current.y
      )
      const magnetStart = 3
      const magnetism = speed < magnetStart ? 0.06 * (1 - speed / magnetStart) : 0

      targetRef.current = {
        x: Math.round(offsetRef.current.x / cellW) * cellW,
        y: Math.round(offsetRef.current.y / vh) * vh,
      }

      const dx = targetRef.current.x - offsetRef.current.x
      const dy = targetRef.current.y - offsetRef.current.y

      offsetRef.current.x += dx * magnetism
      offsetRef.current.y += dy * magnetism

      updateGrid()

      const settled =
        Math.abs(dx) < threshold &&
        Math.abs(dy) < threshold &&
        Math.abs(velocityRef.current.x) < 0.1 &&
        Math.abs(velocityRef.current.y) < 0.1

      if (settled) {
        offsetRef.current.x = targetRef.current.x
        offsetRef.current.y = targetRef.current.y
        velocityRef.current = { x: 0, y: 0 }
        isAnimatingRef.current = false
        updateGrid()
        return
      }

      animFrameRef.current = requestAnimationFrame(springFrame)
    }

    isAnimatingRef.current = true
    animFrameRef.current = requestAnimationFrame(springFrame)
  }, [updateGrid, reportCurrentPoster])

  // Friction-only coast for scroll wheel
  const startCoast = useCallback(() => {
    const coastFriction = 0.97

    function coastFrame() {
      if (!isAnimatingRef.current) return

      velocityRef.current.x *= coastFriction
      velocityRef.current.y *= coastFriction

      offsetRef.current.x += velocityRef.current.x
      offsetRef.current.y += velocityRef.current.y

      updateGrid()

      if (
        Math.abs(velocityRef.current.x) < 0.1 &&
        Math.abs(velocityRef.current.y) < 0.1
      ) {
        velocityRef.current = { x: 0, y: 0 }
        isAnimatingRef.current = false
        return
      }

      animFrameRef.current = requestAnimationFrame(coastFrame)
    }

    isAnimatingRef.current = true
    animFrameRef.current = requestAnimationFrame(coastFrame)
  }, [updateGrid, reportCurrentPoster])

  // Slow drift to nearest poster — takes ~2 seconds
  const startSlowDrift = useCallback(() => {
    const ease = 0.02
    const threshold = 0.3

    function driftFrame() {
      if (!isAnimatingRef.current) return

      const { cellW, vh } = viewportRef.current

      targetRef.current = {
        x: Math.round(offsetRef.current.x / cellW) * cellW,
        y: Math.round(offsetRef.current.y / vh) * vh,
      }

      const dx = targetRef.current.x - offsetRef.current.x
      const dy = targetRef.current.y - offsetRef.current.y

      offsetRef.current.x += dx * ease
      offsetRef.current.y += dy * ease

      updateGrid()

      if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) {
        offsetRef.current.x = targetRef.current.x
        offsetRef.current.y = targetRef.current.y
        isAnimatingRef.current = false
        updateGrid()
        return
      }

      animFrameRef.current = requestAnimationFrame(driftFrame)
    }

    isAnimatingRef.current = true
    animFrameRef.current = requestAnimationFrame(driftFrame)
  }, [updateGrid, reportCurrentPoster])

  const snapToNearest = useCallback(() => {
    velocityRef.current = { x: 0, y: 0 }
    startSpring()
  }, [startSpring])

  const startMomentum = useCallback(() => {
    velocityRef.current.x *= 16
    velocityRef.current.y *= 16
    startSpring()
  }, [startSpring])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    // Initial centering and tile layout
    if (moverRef.current) {
      const { vw, cellW } = viewportRef.current
      const centerOffsetX = (vw - cellW) / 2
      moverRef.current.style.transform = `translate3d(${centerOffsetX}px, 0px, 0)`
    }
    lastCenterRef.current = { row: -999, col: -999 } // force first update
    updateTiles()

    function handleWheel(e) {
      e.preventDefault()
      cancelAnimation()
      wheelActiveRef.current = true

      let dx, dy
      if (e.shiftKey || e.ctrlKey) {
        dx = e.deltaY
        dy = 0
      } else {
        dx = e.deltaX
        dy = e.deltaY
      }

      offsetRef.current.x += dx
      offsetRef.current.y += dy

      const alpha = 0.15
      velocityRef.current.x = alpha * dx + (1 - alpha) * velocityRef.current.x
      velocityRef.current.y = alpha * dy + (1 - alpha) * velocityRef.current.y

      updateGrid()

      clearTimeout(wheelTimeoutRef.current)
      clearTimeout(wheelMagnetTimeoutRef.current)
      wheelTimeoutRef.current = setTimeout(() => {
        startCoast()
      }, 100)
      wheelMagnetTimeoutRef.current = setTimeout(() => {
        wheelActiveRef.current = false
        cancelAnimation()
        startSlowDrift()
      }, 2000)
    }

    function handleTouchStart(e) {
      cancelAnimation()
      const t = e.touches[0]
      touchLastRef.current = { x: t.clientX, y: t.clientY }
      touchTimeRef.current = Date.now()
      isTouchingRef.current = true
      velocityRef.current = { x: 0, y: 0 }
    }

    function handleTouchMove(e) {
      e.preventDefault()
      if (!isTouchingRef.current) return

      const t = e.touches[0]
      const now = Date.now()
      const dt = now - touchTimeRef.current

      const dx = t.clientX - touchLastRef.current.x
      const dy = t.clientY - touchLastRef.current.y

      offsetRef.current.x -= dx
      offsetRef.current.y -= dy

      if (dt > 0) {
        const alpha = 0.8
        velocityRef.current.x = alpha * (-dx / dt) + (1 - alpha) * velocityRef.current.x
        velocityRef.current.y = alpha * (-dy / dt) + (1 - alpha) * velocityRef.current.y
      }

      touchLastRef.current = { x: t.clientX, y: t.clientY }
      touchTimeRef.current = now

      updateGrid()
    }

    function handleTouchEnd() {
      isTouchingRef.current = false
      startMomentum()
    }

    function handleMouseDown(e) {
      cancelAnimation()
      isDraggingRef.current = true
      dragLastRef.current = { x: e.clientX, y: e.clientY }
      dragTimeRef.current = Date.now()
      velocityRef.current = { x: 0, y: 0 }
      document.body.style.cursor = 'grabbing'
    }

    function handleMouseMove(e) {
      if (!isDraggingRef.current) return

      const now = Date.now()
      const dt = now - dragTimeRef.current
      const dx = e.clientX - dragLastRef.current.x
      const dy = e.clientY - dragLastRef.current.y

      offsetRef.current.x -= dx
      offsetRef.current.y -= dy

      if (dt > 0) {
        const alpha = 0.8
        velocityRef.current.x = alpha * (-dx / dt) + (1 - alpha) * velocityRef.current.x
        velocityRef.current.y = alpha * (-dy / dt) + (1 - alpha) * velocityRef.current.y
      }

      dragLastRef.current = { x: e.clientX, y: e.clientY }
      dragTimeRef.current = now

      updateGrid()
    }

    function handleMouseUp() {
      if (!isDraggingRef.current) return
      isDraggingRef.current = false
      document.body.style.cursor = ''
      startMomentum()
    }

    function handleResize() {
      const oldCellW = viewportRef.current.cellW
      const oldVh = viewportRef.current.vh

      const currentCol = Math.round(offsetRef.current.x / oldCellW)
      const currentRow = Math.round(offsetRef.current.y / oldVh)

      viewportRef.current = {
        vw: window.innerWidth,
        vh: window.innerHeight,
        cellW: window.innerHeight * POSTER_ASPECT,
      }

      offsetRef.current.x = currentCol * viewportRef.current.cellW
      offsetRef.current.y = currentRow * viewportRef.current.vh
      velocityRef.current = { x: 0, y: 0 }

      cancelAnimation()
      lastCenterRef.current = { row: -999, col: -999 } // force tile update
      updateGrid()
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    el.addEventListener('touchmove', handleTouchMove, { passive: false })
    el.addEventListener('touchend', handleTouchEnd, { passive: true })
    el.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('resize', handleResize)

    return () => {
      el.removeEventListener('wheel', handleWheel)
      el.removeEventListener('touchstart', handleTouchStart)
      el.removeEventListener('touchmove', handleTouchMove)
      el.removeEventListener('touchend', handleTouchEnd)
      el.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('resize', handleResize)
      cancelAnimation()
      clearTimeout(wheelTimeoutRef.current)
      clearTimeout(wheelMagnetTimeoutRef.current)
    }
  }, [cancelAnimation, updateGrid, updateTiles, snapToNearest, startMomentum, startCoast, startSlowDrift, reportCurrentPoster])

  // Report initial poster
  useEffect(() => {
    onPosterChange(posters[0])
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Render fixed pool of tile divs — never re-rendered by React
  const tileDivs = []
  for (let i = 0; i < TILE_COUNT; i++) {
    tileDivs.push(
      <div
        key={i}
        ref={(el) => { tileEls.current[i] = el }}
        className="grid-tile"
      />
    )
  }

  return (
    <div ref={containerRef} className="infinite-grid-viewport">
      <div ref={moverRef} className="infinite-grid-mover">
        {tileDivs}
      </div>
    </div>
  )
}
