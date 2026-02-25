import React, { useRef, useState, useEffect, useCallback } from 'react'

function mod(n, m) {
  return ((n % m) + m) % m
}

// Poster aspect ratio (width / height) — all posters are 3:4
const POSTER_ASPECT = 3 / 4

export default function InfiniteGrid({ posters, posterImages, onPosterChange }) {
  const containerRef = useRef(null)
  const moverRef = useRef(null)

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

  // Wheel active state — suppress magnetism during scroll wheel input
  const wheelActiveRef = useRef(false)

  // Mouse drag state
  const isDraggingRef = useRef(false)
  const dragLastRef = useRef({ x: 0, y: 0 })
  const dragTimeRef = useRef(0)

  // Track center cell for tile recycling
  const [centerCell, setCenterCell] = useState({ row: 0, col: 0 })
  const centerCellRef = useRef({ row: 0, col: 0 })

  // Viewport and cell dimensions
  const viewportRef = useRef({
    vw: typeof window !== 'undefined' ? window.innerWidth : 1000,
    vh: typeof window !== 'undefined' ? window.innerHeight : 1000,
    cellW: typeof window !== 'undefined' ? window.innerHeight * POSTER_ASPECT : 750,
  })

  const updateTransform = useCallback(() => {
    if (moverRef.current) {
      const { x, y } = offsetRef.current
      const { vw, cellW } = viewportRef.current
      // Center offset so the snapped tile sits in the middle of the viewport
      const centerOffsetX = (vw - cellW) / 2
      moverRef.current.style.transform = `translate3d(${-x + centerOffsetX}px, ${-y}px, 0)`
    }
  }, [])

  const checkTileRecycle = useCallback(() => {
    const { cellW, vh } = viewportRef.current
    const newRow = Math.round(offsetRef.current.y / vh)
    const newCol = Math.round(offsetRef.current.x / cellW)

    if (newRow !== centerCellRef.current.row || newCol !== centerCellRef.current.col) {
      centerCellRef.current = { row: newRow, col: newCol }
      setCenterCell({ row: newRow, col: newCol })
    }
  }, [])

  const cancelAnimation = useCallback(() => {
    isAnimatingRef.current = false
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
  }, [])

  const reportCurrentPoster = useCallback(() => {
    const { cellW, vh } = viewportRef.current
    const row = Math.round(offsetRef.current.y / vh)
    const col = Math.round(offsetRef.current.x / cellW)
    const idx = mod(row + col, posters.length)
    onPosterChange(posters[idx])
  }, [posters, onPosterChange])

  // Unified spring animation: momentum bleeds into snap seamlessly
  const startSpring = useCallback(() => {
    const friction = 0.96    // slower decay — longer glide
    const threshold = 0.3
    const maxVel = 30

    function springFrame() {
      if (!isAnimatingRef.current) return

      const { cellW, vh } = viewportRef.current

      // Clamp and decay velocity
      velocityRef.current.x = Math.max(-maxVel, Math.min(maxVel, velocityRef.current.x)) * friction
      velocityRef.current.y = Math.max(-maxVel, Math.min(maxVel, velocityRef.current.y)) * friction

      // Move by velocity
      offsetRef.current.x += velocityRef.current.x
      offsetRef.current.y += velocityRef.current.y

      // No magnetism while user is actively scrolling with wheel
      if (wheelActiveRef.current) {
        updateTransform()
        checkTileRecycle()
        animFrameRef.current = requestAnimationFrame(springFrame)
        return
      }

      // Speed determines magnetism strength — fast = no pull, slow = gentle pull
      const speed = Math.sqrt(
        velocityRef.current.x * velocityRef.current.x +
        velocityRef.current.y * velocityRef.current.y
      )
      // Magnetism fades in below this speed
      const magnetStart = 3
      const magnetism = speed < magnetStart ? 0.06 * (1 - speed / magnetStart) : 0

      // Nearest poster target
      targetRef.current = {
        x: Math.round(offsetRef.current.x / cellW) * cellW,
        y: Math.round(offsetRef.current.y / vh) * vh,
      }

      const dx = targetRef.current.x - offsetRef.current.x
      const dy = targetRef.current.y - offsetRef.current.y

      // Position lerp only kicks in when slow — lets momentum glide first
      offsetRef.current.x += dx * magnetism
      offsetRef.current.y += dy * magnetism

      updateTransform()
      checkTileRecycle()

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
        updateTransform()
        checkTileRecycle()
        reportCurrentPoster()
        return
      }

      animFrameRef.current = requestAnimationFrame(springFrame)
    }

    isAnimatingRef.current = true
    animFrameRef.current = requestAnimationFrame(springFrame)
  }, [updateTransform, checkTileRecycle, reportCurrentPoster])

  // Friction-only coast for scroll wheel — no magnetism
  const startCoast = useCallback(() => {
    const coastFriction = 0.97

    function coastFrame() {
      if (!isAnimatingRef.current) return

      velocityRef.current.x *= coastFriction
      velocityRef.current.y *= coastFriction

      offsetRef.current.x += velocityRef.current.x
      offsetRef.current.y += velocityRef.current.y

      updateTransform()
      checkTileRecycle()

      if (
        Math.abs(velocityRef.current.x) < 0.1 &&
        Math.abs(velocityRef.current.y) < 0.1
      ) {
        velocityRef.current = { x: 0, y: 0 }
        isAnimatingRef.current = false
        reportCurrentPoster()
        return
      }

      animFrameRef.current = requestAnimationFrame(coastFrame)
    }

    isAnimatingRef.current = true
    animFrameRef.current = requestAnimationFrame(coastFrame)
  }, [updateTransform, checkTileRecycle, reportCurrentPoster])

  // Slow drift to nearest poster — takes ~2 seconds
  const startSlowDrift = useCallback(() => {
    const ease = 0.02 // very gentle — reaches target over ~120 frames (~2s)
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

      updateTransform()
      checkTileRecycle()

      if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) {
        offsetRef.current.x = targetRef.current.x
        offsetRef.current.y = targetRef.current.y
        isAnimatingRef.current = false
        updateTransform()
        checkTileRecycle()
        reportCurrentPoster()
        return
      }

      animFrameRef.current = requestAnimationFrame(driftFrame)
    }

    isAnimatingRef.current = true
    animFrameRef.current = requestAnimationFrame(driftFrame)
  }, [updateTransform, checkTileRecycle, reportCurrentPoster])

  const snapToNearest = useCallback(() => {
    velocityRef.current = { x: 0, y: 0 }
    startSpring()
  }, [startSpring])

  const startMomentum = useCallback(() => {
    // Scale velocity from px/ms to px/frame
    velocityRef.current.x *= 16
    velocityRef.current.y *= 16
    startSpring()
  }, [startSpring])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    // -- Wheel --
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

      // Track wheel velocity with smoothing — low alpha = less throw
      const alpha = 0.15
      velocityRef.current.x = alpha * dx + (1 - alpha) * velocityRef.current.x
      velocityRef.current.y = alpha * dy + (1 - alpha) * velocityRef.current.y

      updateTransform()
      checkTileRecycle()

      clearTimeout(wheelTimeoutRef.current)
      clearTimeout(wheelMagnetTimeoutRef.current)
      wheelTimeoutRef.current = setTimeout(() => {
        startCoast()
      }, 100)
      // Magnetism re-engages 2s after last wheel event — slow drift to nearest
      wheelMagnetTimeoutRef.current = setTimeout(() => {
        wheelActiveRef.current = false
        cancelAnimation()
        startSlowDrift()
      }, 2000)
    }

    // -- Touch --
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
        velocityRef.current.x =
          alpha * (-dx / dt) + (1 - alpha) * velocityRef.current.x
        velocityRef.current.y =
          alpha * (-dy / dt) + (1 - alpha) * velocityRef.current.y
      }

      touchLastRef.current = { x: t.clientX, y: t.clientY }
      touchTimeRef.current = now

      updateTransform()
      checkTileRecycle()
    }

    function handleTouchEnd() {
      isTouchingRef.current = false
      startMomentum()
    }

    // -- Mouse drag --
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
        velocityRef.current.x =
          alpha * (-dx / dt) + (1 - alpha) * velocityRef.current.x
        velocityRef.current.y =
          alpha * (-dy / dt) + (1 - alpha) * velocityRef.current.y
      }

      dragLastRef.current = { x: e.clientX, y: e.clientY }
      dragTimeRef.current = now

      updateTransform()
      checkTileRecycle()
    }

    function handleMouseUp() {
      if (!isDraggingRef.current) return
      isDraggingRef.current = false
      document.body.style.cursor = ''
      startMomentum()
    }

    // -- Resize --
    function handleResize() {
      const oldCellW = viewportRef.current.cellW
      const oldVh = viewportRef.current.vh

      // Preserve which grid cell we're on
      const currentCol = Math.round(offsetRef.current.x / oldCellW)
      const currentRow = Math.round(offsetRef.current.y / oldVh)

      // Update dimensions
      viewportRef.current = {
        vw: window.innerWidth,
        vh: window.innerHeight,
        cellW: window.innerHeight * POSTER_ASPECT,
      }

      // Recompute offset to land on the same cell with new dimensions
      offsetRef.current.x = currentCol * viewportRef.current.cellW
      offsetRef.current.y = currentRow * viewportRef.current.vh
      velocityRef.current = { x: 0, y: 0 }

      cancelAnimation()
      updateTransform()
      // Force tile re-render with new dimensions
      centerCellRef.current = { row: currentRow, col: currentCol }
      setCenterCell({ row: currentRow, col: currentCol })
      reportCurrentPoster()
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
  }, [cancelAnimation, updateTransform, checkTileRecycle, snapToNearest, startMomentum, startCoast, startSlowDrift, reportCurrentPoster])

  // Apply centered transform and report poster on mount
  useEffect(() => {
    updateTransform()
    onPosterChange(posters[0])
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Build 5x3 tile grid (5 columns so side neighbors are always visible)
  const { cellW, vh } = viewportRef.current
  const tiles = []
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -2; dc <= 2; dc++) {
      const row = centerCell.row + dr
      const col = centerCell.col + dc
      const idx = mod(row + col, posters.length)
      tiles.push(
        <div
          key={`${row},${col}`}
          className="grid-tile"
          style={{
            width: cellW,
            left: col * cellW,
            top: row * vh,
            backgroundImage: `url(${posterImages[posters[idx].id]})`,
          }}
        />
      )
    }
  }

  return (
    <div ref={containerRef} className="infinite-grid-viewport">
      <div ref={moverRef} className="infinite-grid-mover">
        {tiles}
      </div>
    </div>
  )
}
