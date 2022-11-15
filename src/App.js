import React from 'react';
import {
  ChakraProvider,
  Box,
  Text,
  Link,
  VStack,
  Grid,
  theme,
  extendTheme
} from '@chakra-ui/react';
import { ColorModeSwitcher } from './ColorModeSwitcher';
import { Logo } from './Logo';
import { mode } from '@chakra-ui/theme-tools'

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
      darkback: '#192817'
  },
  styles: {
    global: (props) => ({
      body: {
        bg: mode('black', 'black')(props),
        backgroundSize: '40px 40px',
        backgroundPosition: '0 0, 0 20px, 20px -20px, -20px 0px'
      }
    })
  }
});

function App() {
  return (
    <ChakraProvider theme={myTheme}>
      <Box textAlign="center" fontSize="xl">
        <Grid minH="100vh" p={0}>
          <VStack spacing={2}>
            <Logo w="100vw" pointerEvents="none" />
            <Link
              color="white"
              href="https://create.zora.co/collections/0x892e712e7917c06bf3b73260c7a535ec006512d6"
            >
              𝙳𝙾 𝚈𝙾𝚄 𝙻𝙾𝚅𝙴 𝙿𝙾𝚂𝚃𝙴𝚁 𝙾𝙾𝟻?
            </Link>
            <Text
              color="white"
              pointerEvents="none"
            >
              𝙳𝙾 𝚈𝙾𝚄 𝙻𝙾𝚅𝙴 𝙿𝚄𝙽𝙺 𝘌𝘕𝘌𝘙𝘎𝘠?
            </Text>
            <Link
              padding="1vw"
              color="black"
              href="https://www.twitter.com/ppuunnkkdotcom"
              fontSize="8xl"
              target="_blank"
              rel="noopener noreferrer"
            >
              🫡
            </Link>
            <Link
              backgroundColor="green"
              padding="1vw"
              color="black"
              href="https://www.ppuunnkk.com/"
              fontSize="3xl"
              target="_blank"
              rel="noopener noreferrer"
            >
              𝙵𝚁𝙴𝙴 𝚈𝙾𝚄𝚁 𝙿𝚄𝙽𝙺.
            </Link>
            <Box
              p={4}
            />
          </VStack>
        </Grid>
      </Box>
    </ChakraProvider>
  );
}

export default App;
