import React, { useState, useEffect } from 'react';
import { useKeenSlider } from 'keen-slider/react';
import { ChakraProvider, Button, Flex, Link, extendTheme } from '@chakra-ui/react';
import TopRight from './components/TopRight';
import PunkIcon from "./components/Icon";
import { posters } from './postersData';
import 'keen-slider/keen-slider.min.css';
import './styles.css';
import { NoiseOverlay } from './components/NoiseOverlay';

const myTheme = extendTheme({
  config: {
	useSystemColorMode: false,
  },
  colors: {
	green: '#00FF46',
	blue: '#0075FF',
	orange: '#FF7F00',
	yellow: '#FFFF00',
	chartreuse: '#B5FF00',
	pink: '#FF00C4',
	darkback: '#192817',
  },
});

const Zorb = () => (
  <svg width="64" height="64" viewBox="0 0 693 693" fill="none" xmlns="http://www.w3.org/2000/svg">
	<path d="M0 346.5C0 537.587 155.413 693 346.5 693C537.587 693 693 537.587 693 346.5C692.823 155.413 537.411 0 346.5 0C155.413 0 0 155.413 0 346.5Z" fill="url(#paint0_radial)" />
	<defs>
	  <radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(450.164 168.797) scale(521.764)">
		<stop offset="0.15625" stopColor="#DCC8D0" />
		<stop offset="0.302083" stopColor="#78C8CF" />
		<stop offset="0.427083" stopColor="#4D959E" />
		<stop offset="0.557292" stopColor="#305EB9" />
		<stop offset="0.796875" stopColor="#311F12" />
		<stop offset="0.90625" stopColor="#563E34" />
		<stop offset="1" stopColor="#2D1C13" />
	  </radialGradient>
	</defs>
  </svg>
);

const WheelControls = (slider) => {
  let touchTimeout;
  let position;
  let wheelActive;

  function dispatch(e, name) {
	position.x -= e.deltaX;
	position.y -= e.deltaY;
	slider.container.dispatchEvent(
	  new CustomEvent(name, {
		detail: { x: position.x, y: position.y },
	  })
	);
  }

  function wheelStart(e) {
	position = { x: e.pageX, y: e.pageY };
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
	slider.container.addEventListener("wheel", eventWheel, { passive: false });
  });
};

const PosterButton = ({ backgroundColor, hoverColor, href, text }) => (
  <Flex pos="fixed" bottom="20vh" left="-1vh" textTransform="uppercase" transform="rotate(-90deg)">
	<Button
	  flexDirection="row"
	  backgroundColor={backgroundColor}
	  borderRadius="36"
	  color="darkback"
	  fontSize={['2xs', 'xs', 'md', 'x-large', '2xl']}
	  target="_blank"
	  rel="noopener noreferrer"
	  variant="button"
	  _hover={{ bg: hoverColor, color: backgroundColor }}
	>
	  <Flex alignItems="center">
		<Zorb />
		<Link href={href} variant="none" isExternal>
		  <p style={{ transform: 'scaleY(2.4) scale(.666)', marginLeft: '8px' }}>{text}</p>
		</Link>
	  </Flex>
	</Button>
  </Flex>
);

const formatPosterNumber = (number) => {
  return number.toString().padStart(3, '0').slice(-3);
};

export default function App() {
  const [sliderRef] = useKeenSlider({
	mode: 'free',
	loop: true,
	rubberband: false,
	overflow: 'scroll',
	vertical: true,
  }, [WheelControls]);

  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
	const handleScroll = () => {
	  setScrollPosition(window.pageYOffset);
	};

	window.addEventListener('scroll', handleScroll);

	return () => {
	  window.removeEventListener('scroll', handleScroll);
	};
  }, []);

  return (
	<ChakraProvider theme={myTheme}>
	  <>
		<TopRight />
		<div ref={sliderRef} className="keen-slider-scrollable" style={{ height: '100vh' }}>
		  {posters.map((poster, index) => (
			<div key={poster.id} className={`keen-slider__slide number-slide${index + 1}`}>
			  <PosterButton
				backgroundColor={poster.backgroundColor}
				hoverColor={poster.hoverColor}
				href={poster.href}
				text={`Poster ${formatPosterNumber(poster.id)}`}
			  />
			</div>
		  ))}
		</div>
		<NoiseOverlay />
	  </>
	</ChakraProvider>
  );
}
