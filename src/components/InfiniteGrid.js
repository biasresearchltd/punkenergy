import React, { useRef, useEffect, useCallback, useState } from 'react'

function mod(n, m) {
  return ((n % m) + m) % m
}

const POSTER_ASPECT = 3 / 4

function computeTileCounts() {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const cellW = Math.min(vw, vh * POSTER_ASPECT)
  const cellH = cellW / POSTER_ASPECT
  let cols = Math.max(5, Math.ceil(vw / cellW) + 4)
  let rows = Math.max(3, Math.ceil(vh / cellH) + 2)
  if (cols % 2 === 0) cols++
  if (rows % 2 === 0) rows++
  return { tileCols: cols, tileRows: rows }
}

export default function InfiniteGrid({ posters, posterImages, onPosterChange }) {
  const [{ tileCols, tileRows }, setTileCounts] = useState(computeTileCounts)
  const tileCount = tileCols * tileRows
  const halfC = Math.floor(tileCols / 2)
  const halfR = Math.floor(tileRows / 2)

  const containerRef = useRef(null)
  const moverEvenRef = useRef(null)
  const moverOddRef = useRef(null)
  const tileEls = useRef([])

  const offsetRef = useRef({ x: 0, y: 0 })
  const velocityRef = useRef({ x: 0, y: 0 })
  const targetRef = useRef({ x: 0, y: 0 })

  const animFrameRef = useRef(null)
  const isAnimatingRef = useRef(false)

  const wheelTimeoutRef = useRef(null)
  const wheelMagnetTimeoutRef = useRef(null)

  const touchLastRef = useRef({ x: 0, y: 0 })
  const touchTimeRef = useRef(0)
  const isTouchingRef = useRef(false)

  const wheelActiveRef = useRef(false)

  const isDraggingRef = useRef(false)
  const dragLastRef = useRef({ x: 0, y: 0 })
  const dragTimeRef = useRef(0)

  const lastCenterColRef = useRef(-999)
  const lastColRowCentersRef = useRef(new Array(tileCols).fill(-999))
  const tilePosterRef = useRef(new Array(tileCount).fill(null))
  const lastPosterIdRef = useRef(null)

  const initVw = typeof window !== 'undefined' ? window.innerWidth : 1000
  const initVh = typeof window !== 'undefined' ? window.innerHeight : 1000
  const initCellW = Math.min(initVw, initVh * POSTER_ASPECT)
  const viewportRef = useRef({
    vw: initVw,
    vh: initVh,
    cellW: initCellW,
    cellH: initCellW / POSTER_ASPECT,
  })

  // Precompute direction for each pool column
  const colDirs = useRef([])
  useEffect(() => {
    const dirs = []
    for (let c = 0; c < tileCols; c++) {
      const dc = c - halfC
      dirs.push(Math.abs(dc) % 2 === 0 ? 1 : -1)
    }
    colDirs.current = dirs
    lastColRowCentersRef.current = new Array(tileCols).fill(-999)
    tilePosterRef.current = new Array(tileCount).fill(null)
    lastCenterColRef.current = -999
  }, [tileCols, tileCount, halfC])

  const updateTiles = useCallback(() => {
    const { cellW, cellH } = viewportRef.current
    const { x, y } = offsetRef.current
    const centerCol = Math.round(x / cellW)

    const colChanged = centerCol !== lastCenterColRef.current
    if (colChanged) lastCenterColRef.current = centerCol

    for (let c = 0; c < tileCols; c++) {
      const dc = c - halfC
      const actualCol = centerCol + dc
      const dir = colDirs.current[c]

      const effectiveY = dir * y
      const centerRowForCol = Math.round(effectiveY / cellH)

      const rowChanged = centerRowForCol !== lastColRowCentersRef.current[c]
      if (!colChanged && !rowChanged) continue
      lastColRowCentersRef.current[c] = centerRowForCol

      for (let r = 0; r < tileRows; r++) {
        const dr = r - halfR
        const row = centerRowForCol + dr
        const idx = mod(row + actualCol, posters.length)
        const posterId = posters[idx].id
        const tileIdx = c * tileRows + r
        const el = tileEls.current[tileIdx]
        if (el) {
          el.style.left = `${actualCol * cellW}px`
          el.style.top = `${row * cellH}px`
          el.style.width = `${cellW}px`
          el.style.height = `${cellH}px`
          if (tilePosterRef.current[tileIdx] !== posterId) {
            tilePosterRef.current[tileIdx] = posterId
            const img = el.firstChild
            if (img) img.src = posterImages[posterId]
          }
        }
      }
    }
  }, [posters, posterImages, tileCols, tileRows, halfC, halfR])

  // Only 2 DOM writes per frame — one per mover
  const updateTransform = useCallback(() => {
    const { x, y } = offsetRef.current
    const { vw, cellW } = viewportRef.current
    const centerOffsetX = (vw - cellW) / 2
    if (moverEvenRef.current) {
      moverEvenRef.current.style.transform = `translate3d(${-x + centerOffsetX}px, ${-y}px, 0)`
    }
    if (moverOddRef.current) {
      moverOddRef.current.style.transform = `translate3d(${-x + centerOffsetX}px, ${y}px, 0)`
    }
  }, [])

  const reportCurrentPoster = useCallback(() => {
    const { cellW, cellH } = viewportRef.current
    const { x, y } = offsetRef.current
    const col = Math.round(x / cellW)
    const row = Math.round(y / cellH)
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

  const startSpring = useCallback(() => {
    const friction = 0.96
    const threshold = 0.3
    const maxVel = 30

    function springFrame() {
      if (!isAnimatingRef.current) return

      const { cellW, cellH } = viewportRef.current

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
        y: Math.round(offsetRef.current.y / cellH) * cellH,
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
  }, [updateGrid])

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
  }, [updateGrid])

  const startSlowDrift = useCallback(() => {
    const ease = 0.02
    const threshold = 0.3

    function driftFrame() {
      if (!isAnimatingRef.current) return

      const { cellW, cellH } = viewportRef.current

      targetRef.current = {
        x: Math.round(offsetRef.current.x / cellW) * cellW,
        y: Math.round(offsetRef.current.y / cellH) * cellH,
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
  }, [updateGrid])

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

    // Initial transforms
    const { vw, cellW } = viewportRef.current
    const centerOffsetX = (vw - cellW) / 2
    if (moverEvenRef.current) {
      moverEvenRef.current.style.transform = `translate3d(${centerOffsetX}px, 0px, 0)`
    }
    if (moverOddRef.current) {
      moverOddRef.current.style.transform = `translate3d(${centerOffsetX}px, 0px, 0)`
    }
    lastCenterColRef.current = -999
    lastColRowCentersRef.current.fill(-999)
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
      const oldCellH = viewportRef.current.cellH

      const currentCol = Math.round(offsetRef.current.x / oldCellW)
      const currentRow = Math.round(offsetRef.current.y / oldCellH)

      const newCellW = Math.min(window.innerWidth, window.innerHeight * POSTER_ASPECT)
      viewportRef.current = {
        vw: window.innerWidth,
        vh: window.innerHeight,
        cellW: newCellW,
        cellH: newCellW / POSTER_ASPECT,
      }

      offsetRef.current.x = currentCol * viewportRef.current.cellW
      offsetRef.current.y = currentRow * viewportRef.current.cellH
      velocityRef.current = { x: 0, y: 0 }

      cancelAnimation()
      setTileCounts(computeTileCounts())
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
  }, [tileCols, tileRows, cancelAnimation, updateGrid, updateTiles, snapToNearest, startMomentum, startCoast, startSlowDrift, reportCurrentPoster])

  useEffect(() => {
    onPosterChange(posters[0])
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const preloadedRef = useRef(false)
  useEffect(() => {
    if (preloadedRef.current) return
    preloadedRef.current = true
    posters.forEach((p) => {
      const img = new Image()
      img.src = posterImages[p.id]
    })
  }, [posters, posterImages])

  // Split tiles between two movers based on pool column direction
  const evenTiles = []
  const oddTiles = []
  for (let c = 0; c < tileCols; c++) {
    const dc = c - halfC
    const isOdd = Math.abs(dc) % 2 !== 0
    for (let r = 0; r < tileRows; r++) {
      const tileIdx = c * tileRows + r
      const tile = (
        <div
          key={tileIdx}
          ref={(el) => { tileEls.current[tileIdx] = el }}
          className="grid-tile"
        >
          <img src="" alt="" draggable={false} />
        </div>
      )
      if (isOdd) oddTiles.push(tile)
      else evenTiles.push(tile)
    }
  }

  return (
    <div ref={containerRef} className="infinite-grid-viewport">
      <div ref={moverEvenRef} className="infinite-grid-mover">
        {evenTiles}
      </div>
      <div ref={moverOddRef} className="infinite-grid-mover">
        {oddTiles}
      </div>
    </div>
  )
}
