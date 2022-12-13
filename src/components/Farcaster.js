import React from 'react';
import { Box, Image, Link } from '@chakra-ui/react';
import logo from './Cuberton.gif';


export const Logo = props => {
  
  return <Box position="fixed" padding="8" top="0" right="0" zIndex="9">
	<Link href="https://www.ppuunnkk.com" target="_blank"><img src={logo} alt="Animated JIF" /></Link>
  </Box>;
};