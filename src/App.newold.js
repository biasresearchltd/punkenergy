import React, { useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { Logo } from './components/Logo';
import { NoiseOverlay } from './components/NoiseOverlay';
import "./styles.css";
import image1 from "./pstr/pstr001.png";
import image2 from "./pstr/pstr002.png";
import image3 from "./pstr/pstr003.png";
import image4 from "./pstr/pstr004.png";
import image5 from "./pstr/pstr005.png";
import image6 from "./pstr/pstr006.png";
import image7 from "./pstr/pstr007.png";

const WheelControls = (slider) => {
  let touchTimeout;
  let position;
  let wheelActive;

  function dispatch(e, name) {
	position.x -= e.deltaX;
	position.y -= e.deltaY;
	slider.container.dispatchEvent(
	  new CustomEvent(name, {
		detail: {
		  x: position.x,
		  y: position.y
		}
	  })
	);
  }

  function wheelStart(e) {
	position = {
	  x: e.pageX,
	  y: e.pageY
	};
	dispatch(e, "ksDragStart");
  }

  function wheel(e) {
	dispatch(e, "ksDrag");
  }

  function wheelEnd(e) {
	dispatch(e, "ksDragEnd");
  }

  function eventWheel(e) {
	e.preventDefault();
	if (!wheelActive) {
	  wheelStart(e);
	  wheelActive = true;
	}
	wheel(e);
	clearTimeout(touchTimeout);
	touchTimeout = setTimeout(() => {
	  wheelActive = false;
	  wheelEnd(e);
	}, 50);
  }

  slider.on("created", () => {
	slider.container.addEventListener("wheel", eventWheel, {
	  passive: false
	});
  });
};

export default function App() {
  const [sliderRef] = useKeenSlider(
	{
	  mode: 'free',
	  loop: true,
	  rubberband: false,
	  vertical: true,
	  horizontal: true,
	},
	[WheelControls]
  );

  return (
    <>
	<Logo />
		<div ref={sliderRef} className="keen-slider" style={{ height: "100vh" }}>
		  <img src={image1} className="keen-slider__slide" alt="slide 1" style={{ objectFit: "contain" }} />
		  <img src={image2} className="keen-slider__slide" alt="slide 2" style={{ objectFit: "contain" }} />
		  <img src={image3} className="keen-slider__slide" alt="slide 3" style={{ objectFit: "contain" }} />
		  <img src={image4} className="keen-slider__slide" alt="slide 4" style={{ objectFit: "contain" }} />
		  <img src={image5} className="keen-slider__slide" alt="slide 5" style={{ objectFit: "contain" }} />
		  <img src={image6} className="keen-slider__slide" alt="slide 6" style={{ objectFit: "contain" }} />
		  <img src={image7} className="keen-slider__slide" alt="slide 7" style={{ objectFit: "contain" }} />
		</div>
	  <NoiseOverlay />
    </>
	  );
}
