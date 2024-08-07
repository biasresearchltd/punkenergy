import React, { useEffect, useRef } from 'react';

export const NoiseOverlay = () => {
  const greyCanvasRef = useRef(null);
  const darkCanvasRef = useRef(null);

  useEffect(() => {
    const greyCanvas = greyCanvasRef.current;
    const darkCanvas = darkCanvasRef.current;
    let width = window.innerWidth;
    let height = window.innerHeight;
    const greyCtx = greyCanvas.getContext('2d');
    const darkCtx = darkCanvas.getContext('2d');
    let noiseData = [];
    let frame = 0;
    let loopTimeout;
    let animationRequestId;
    let resizeThrottle;

    // Determine the grain size based on the screen size
    const isMobile = width <= 768;
    const grainSize = isMobile ? 2 : 1;

    const createNoise = () => {
      const greyData = greyCtx.createImageData(width, height);
      const darkData = darkCtx.createImageData(width, height);
      const greyBuffer32 = new Uint32Array(greyData.data.buffer);
      const darkBuffer32 = new Uint32Array(darkData.data.buffer);
      const len = greyBuffer32.length;

      for (let i = 0; i < len; i += grainSize) {
        const randomValue = Math.random();
        if (randomValue < 0.0666) {
          greyBuffer32[i] = 0xffffffff; // white
        } else if (randomValue < 0.1666) {
          darkBuffer32[i] = 0xff000000; // black
        }
      }

      noiseData.push({ grey: greyData, dark: darkData });
    };

    const paintNoise = () => {
      if (frame === 9) {
        frame = 0;
      } else {
        frame++;
      }

      greyCtx.putImageData(noiseData[frame].grey, 0, 0);
      darkCtx.putImageData(noiseData[frame].dark, 0, 0);
    };

    const loop = () => {
      paintNoise(frame);

      frame = (frame + 1) % 10; // wrap around after 10 frames

      loopTimeout = window.setTimeout(() => {
        loop();
      }, 41.6667);
    };

    const init = () => {
      greyCanvas.width = width;
      greyCanvas.height = height;
      darkCanvas.width = width;
      darkCanvas.height = height;

      for (let i = 0; i < 10; i++) {
        createNoise();
      }

      loop();
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      greyCanvas.width = width;
      greyCanvas.height = height;
      darkCanvas.width = width;
      darkCanvas.height = height;
      noiseData = [];
      init();
    };

    window.addEventListener('resize', handleResize);

    init();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.clearTimeout(loopTimeout);
    };
  }, []);

  return (
    <>
      <canvas
        ref={greyCanvasRef}
        id="grey-noise"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '100vw',
          zIndex: 8,
          pointerEvents: 'none',
          opacity: 0.266,
          transform: 'translateZ(0)',
          mixBlendMode: 'screen',
          filter: 'blur(.366px)',
        }}
      />
      <canvas
        ref={darkCanvasRef}
        id="dark-noise"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '100vw',
          zIndex: 9999,
          pointerEvents: 'none',
          opacity: 0.666,
          transform: 'translateZ(0)',
          mixBlendMode: 'overlay',
          filter: 'blur(.666px)',
        }}
      />
    </>
  );
};
