import React, { useEffect } from 'react';

export const NoiseOverlay = () => {
  useEffect(() => {
    let canvas;
    let ctx;
    let wWidth;
    let wHeight;
    let noiseData = [];
    let frame = 0;
    let loopTimeout;
    let resizeThrottle;

    const noise = () => {
      const createNoise = () => {
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

        ctx.putImageData(noiseData[frame], 0, 0);
      };

      const loop = () => {
        paintNoise(frame);

        loopTimeout = window.setTimeout(() => {
          window.requestAnimationFrame(loop);
        }, 1000 / 25);
      };

      const setup = () => {
        wWidth = window.innerWidth;
        wHeight = window.innerHeight;

        canvas.width = wWidth;
        canvas.height = wHeight;

        for (let i = 0; i < 10; i++) {
          createNoise();
        }

        loop();
      };

      const reset = () => {
        window.addEventListener(
          'resize',
          () => {
            window.clearTimeout(resizeThrottle);

            resizeThrottle = window.setTimeout(() => {
              window.clearTimeout(loopTimeout);
              setup();
            }, 200);
          },
          false
        );
      };

      const init = () => {
        canvas = document.getElementById('noise');
        ctx = canvas.getContext('2d');

        setup();
      };

      reset();
      init();
    };

    noise();
  }, []);

  return (
    <canvas
      id="noise"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: '100%',
        zIndex: 9999,
        pointerEvents: 'none',
        opacity: 0.14,
      }}
    />
  );
};
