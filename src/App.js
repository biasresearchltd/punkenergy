import React from "react"
import { useKeenSlider } from "keen-slider/react"
import "keen-slider/keen-slider.min.css"
import "./styles.css"

export default () => {
  const [slider1Ref] = useKeenSlider({
	loop: true,
	mode: "free",
	slides: {
	  origin: "center",
	  perView: 1,
	},
	overflow: "scroll",
	selector: ".first > .keen-slider__slide",
  })

  const [slider2Ref] = useKeenSlider({
	loop: true,
	mode: "free",
	slides: {
	  perView: 1,
	},
  })

  const [slider3Ref] = useKeenSlider({
	loop: true,
	mode: "free",
	rubberband: false,
	slides: {
	  perView: 1,
	},
	vertical: true,
  })

  return (
	<div ref={slider1Ref} className="keen-slider first">
	  <div className="keen-slider__slide number-slide1">𝙿𝙾𝚂𝚃𝙴𝚁 𝟶𝟶𝟷</div>
	  <div className="keen-slider__slide number-slide2" style={{ minWidth: "100%", maxWidth: "auto" }}>
		<div
		  ref={slider2Ref}
		  className="keen-slider"
		  style={{ minWidth: "100%", maxWidth: "auto" }}
		>
		  <div className="keen-slider__slide number-slide2">𝙿𝙾𝚂𝚃𝙴𝚁 𝟶𝟶𝟸</div>
		  <div className="keen-slider__slide number-slide3">𝙿𝙾𝚂𝚃𝙴𝚁 𝟶𝟶𝟹</div>
		  <div className="keen-slider__slide number-slide4">𝙿𝙾𝚂𝚃𝙴𝚁 𝟶𝟶𝟺</div>
		</div>
	  </div>
	  <div className="keen-slider__slide number-slide3">
		<div
		  ref={slider3Ref}
		  className="keen-slider"
		  style={{ height: "100vh", width: "auto" }}
		>
		  <div className="keen-slider__slide number-slide5">𝙿𝙾𝚂𝚃𝙴𝚁 𝟶𝟶𝟻</div>
		  <div className="keen-slider__slide number-slide6">𝙿𝙾𝚂𝚃𝙴𝚁 𝟶𝟶𝟼</div>
		  <div className="keen-slider__slide number-slide7">𝙿𝙾𝚂𝚃𝙴𝚁 𝟶𝟶𝟽</div>
		</div>
	  </div>
	  <div className="keen-slider__slide number-slide8">𝙿𝙾𝚂𝚃𝙴𝚁 𝟶𝟶𝟾</div>
	</div>
  )
}
