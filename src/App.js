import React from 'react';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import './styles.css';
import { NoiseOverlay } from './components/NoiseOverlay';

export default function App() {
  const [sliderRef] = useKeenSlider({
    mode: 'free',
    loop: 'true',
    rubberband: false,
    overflow: 'scroll',
    vertical: true,
  });

  return (
    <>
      <div
        ref={sliderRef}
        className="keen-slider-scrollable"
        style={{ height: '100vh' }}
      >
        <div className="keen-slider__slide number-slide1">
          <p>Poster 001</p>
        </div>
        <div className="keen-slider__slide number-slide2">
          <p>Poster 002</p>
        </div>
        <div className="keen-slider__slide number-slide3">
          <p>Poster 003</p>
        </div>
        <div className="keen-slider__slide number-slide4">
          <p>Poster 004</p>
        </div>
        <div className="keen-slider__slide number-slide5">
          <p>Poster 005</p>
        </div>
        <div className="keen-slider__slide number-slide6">
          <p>Poster 006</p>
        </div>
      </div>
      <NoiseOverlay />
    </>
  );
}
