import React from "react"
import { useKeenSlider } from "keen-slider/react"
import "keen-slider/keen-slider.min.css"
import { poster001 } from './pstr/pstr001.png'
import { poster002 } from './pstr/pstr002.png'
import { poster003 } from './pstr/pstr003.png'
import { poster004 } from './pstr/pstr004.png'
import { poster005 } from './pstr/pstr005.png'
// import "./styles.css"

const Slider () => {
  const [sliderRef] = useKeenSlider({
	loop: true,
	mode: "free-snap",
	slides: {
	  perView: 3,
	  spacing: 15,
	},
  })

  return (
	<div ref={sliderRef} className="keen-slider">
	  <div className="keen-slider__slide number-slide1">1</div>
	  <div className="keen-slider__slide number-slide2">2</div>
	  <div className="keen-slider__slide number-slide3">3</div>
	  <div className="keen-slider__slide number-slide4">4</div>
	  <div className="keen-slider__slide number-slide5">5</div>
	  <div className="keen-slider__slide number-slide6">6</div>
	</div>
  )
}

export default Slider;