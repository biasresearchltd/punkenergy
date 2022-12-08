import React, { useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import "./styles.css";

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
	  loop: false,
	  rubberband: false,
	  vertical: true
	},
	[WheelControls]
  );

  return (
	<div ref={sliderRef} className="keen-slider" style={{ height: "100vh" }}>
	  <div className="keen-slider__slide number-slide1">𝙿𝙾𝚂𝚃𝙴𝚁 𝟶𝟶𝟷</div>
	  <div className="keen-slider__slide number-slide2">𝙿𝙾𝚂𝚃𝙴𝚁 𝟶𝟶𝟸</div>
	  <div className="keen-slider__slide number-slide3">𝙿𝙾𝚂𝚃𝙴𝚁 𝟶𝟶𝟹</div>
	  <div className="keen-slider__slide number-slide4">𝙿𝙾𝚂𝚃𝙴𝚁 𝟶𝟶𝟺</div>
	  <div className="keen-slider__slide number-slide5">𝙿𝙾𝚂𝚃𝙴𝚁 𝟶𝟶𝟻</div>
	  <div className="keen-slider__slide number-slide6">𝙿𝙾𝚂𝚃𝙴𝚁 𝟶𝟶𝟼</div>
	</div>
  );
}


