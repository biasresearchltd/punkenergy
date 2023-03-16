import React, { useState } from 'react';
import { useKeenSlider } from 'keen-slider/react';

const images = [
  './pstr/pstr001.png',
  './pstr/pstr002.png',
  './pstr/pstr003.png',
  './pstr/pstr004.png',
  './pstr/pstr005.png',
  './pstr/pstr006.png',
  './pstr/pstr007.png',
];

const Slider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sliderRef, slider] = useKeenSlider({
	loop: true,
	vertical: true,
	slidesPerView: 1,
	mode: 'free',
	slideChanged(s) {
	  setCurrentSlide(s.details().relativeSlide);
	},
  });

  const handleHorizontalScroll = (e) => {
	if (e.deltaX > 0) {
	  slider.next();
	} else {
	  slider.prev();
	}
  };

  return (
	<div
	  className="keen-slider-wrapper"
	  style={{ height: '100vh' }}
	  onWheel={handleHorizontalScroll}
	>
	  <div ref={sliderRef} className="keen-slider" style={{ width: '100vw' }}>
		{images.map((image, index) => (
		  <div
			key={index}
			className={`keen-slider__slide number-slide${index + 1}`}
		  >
			<img src={image} alt={`Poster ${index + 1}`} />
		  </div>
		))}
	  </div>
	</div>
  );
};

export default Slider;
