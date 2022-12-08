import React from "react"
import { useState } from "react"
import { useKeenSlider } from "keen-slider/react"
import "keen-slider/keen-slider.min.css"
import "./styles.css"

const WheelControls = (slider) => {
  let touchTimeout
  let position
  let wheelActive

  function dispatch(e, name) {
	position.x -= e.deltaX
	position.y -= e.deltaY
	slider.container.dispatchEvent(
	  new CustomEvent(name, {
		detail: {
		  x: position.x,
		  y: position.y,
		},
	  })
	)
  }

  function wheelStart(e) {
	position = {
	  x: e.pageX,
	  y: e.pageY,
	}
	dispatch(e, "ksDragStart")
  }

  function wheel(e) {
	dispatch(e, "ksDrag")
  }

  function wheelEnd(e) {
	dispatch(e, "ksDragEnd")
  }

  function eventWheel(e) {
	e.preventDefault()
	if (!wheelActive) {
	  wheelStart(e)
	  wheelActive = true
	}
	wheel(e)
	clearTimeout(touchTimeout)
	touchTimeout = setTimeout(() => {
	  wheelActive = false
	  wheelEnd(e)
	}, 50)
  }

  slider.on("created", () => {
	slider.container.addEventListener("wheel", eventWheel, {
	  passive: false,
	})
  })
}

export default function App() {
  const [sliderRef] = useKeenSlider(
	{
	  mode: 'free',
	  loop: 'true',
	  rubberband: false,
	  overflow: 'scroll',
	  vertical: true,
	}
  )
	
  return (
	<div ref={sliderRef} className="keen-slider-scrollable" style={{ height: "100vh" }}>
	  <div className="keen-slider__slide number-slide1"><p>Poster 001</p></div>
	  <div className="keen-slider__slide number-slide2"><p>Poster 002</p></div>
	  <div className="keen-slider__slide number-slide3"><p>Poster 003</p></div>
	  <div className="keen-slider__slide number-slide4"><p>Poster 004</p></div>
	  <div className="keen-slider__slide number-slide5"><p>Poster 005</p></div>
	  <div className="keen-slider__slide number-slide6"><p>Poster 006</p></div>
	</div>
  )
}
