import React, { useEffect, useRef } from 'react';

const NoiseOverlay = () => {
  const canvasRef = useRef(null);
  let noiseData = [];
  let frame = 0;
  let loopTimeout;

  // Create Noise
  const createNoise = () => {
    const ctx = canvasRef.current.getContext('2d');
    const wWidth = window.innerWidth;
    const wHeight = window.innerHeight;
    const idata = ctx.createImageData(wWidth, wHeight);
    const buffer32 = new Uint32Array(idata.data.buffer);
    const len = buffer32.length;
    for (let i = 0; i < len; i++) {
      if (Math.random() < 0.0666) {
        buffer32[i] = 0xffffffff;
      }
    }
    noiseData.push(idata);
  };

  const paintNoise = () => {
    if (frame === 9) {
      frame = 0;
    } else {
      frame++;
    }
    canvasRef.current.getContext('2d').putImageData(noiseData[frame], 0, 0);
  };

  const loop = () => {
    paintNoise(frame);
    loopTimeout = window.setTimeout(() => {
      window.requestAnimationFrame(loop);
    }, 1000 / 25);
  };

  const setup = () => {
    canvasRef.current.width = window.innerWidth;
    canvasRef.current.height = window.innerHeight;
    for (let i = 0; i < 9; i++) {
      createNoise();
    }
    loop();
  };

  let resizeThrottle;
  const reset = () => {
    window.addEventListener('resize', () => {
      window.clearTimeout(resizeThrottle);
      resizeThrottle = window.setTimeout(() => {
        window.clearTimeout(loopTimeout);
        setup();
      }, 200);
    });
  };

  useEffect(() => {
    setup();
    reset();
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999,
        opacity: 0.14,
      }}
    >
      <canvas
        ref={canvasRef}
        id="noise"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
        }}
      />
    </div>
  );
};

export default NoiseOverlay;
