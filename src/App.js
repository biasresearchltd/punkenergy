import React, { useState, useCallback } from 'react'
import { ChakraProvider, Button, Flex, extendTheme } from '@chakra-ui/react'
import TopRight from './components/TopRight'
import InfiniteGrid from './components/InfiniteGrid'
import { posters, posterImages } from './postersData'
import { NoiseOverlay } from './components/NoiseOverlay'
import './styles.css'

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
})

const PosterButton = ({ backgroundColor, hoverColor, text }) => (
  <Flex pos="fixed" bottom="20vh" left="-1vh" textTransform="uppercase" transform="rotate(-90deg)" zIndex="10">
    <Button
      flexDirection="row"
      backgroundColor={backgroundColor}
      borderRadius="36"
      color="darkback"
      fontSize={['2xs', 'xs', 'md', 'x-large', '2xl']}
      variant="button"
      cursor="default"
      _hover={{ bg: hoverColor, color: backgroundColor }}
    >
      <p style={{ transform: 'scaleY(2.4) scale(.666)', cursor: 'default' }}>{text}</p>
    </Button>
  </Flex>
)

const formatPosterNumber = (number) => {
  return number.toString().padStart(3, '0').slice(-3)
}

export default function App() {
  const [currentPoster, setCurrentPoster] = useState(posters[0])

  const handlePosterChange = useCallback((poster) => {
    setCurrentPoster(poster)
  }, [])

  return (
    <ChakraProvider theme={myTheme}>
      <>
        <TopRight />
        <InfiniteGrid
          posters={posters}
          posterImages={posterImages}
          onPosterChange={handlePosterChange}
        />
        <PosterButton
          backgroundColor={currentPoster.backgroundColor}
          hoverColor={currentPoster.hoverColor}
          text={`Poster ${formatPosterNumber(currentPoster.id)}`}
        />
        <NoiseOverlay />
      </>
    </ChakraProvider>
  )
}
