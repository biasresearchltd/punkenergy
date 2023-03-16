import React from 'react';
import { Box, Image, Link } from '@chakra-ui/react';
import logo from './Cuberton.gif';


export const Logo = props => {
  
  return <Box h="72px" w="72px" zIndex="9">
	<Link href="https://www.ppuunnkk.com" target="_blank">
  <Image src={logo} alt="Animated JIF" height="72px" width="72px"/>
  </Link>
  </Box>;
};
