import React from 'react';
import { VStack, Flex } from '@chakra-ui/react';
import { Logo } from './Logo';
import PunkIcon from "./Icon";

 const punkStep = () => {
	window.open("https://www.punkstep.com", "_blank");
  };

const TopRightComponent = () => {
  return (
	<VStack
	  position="fixed"
	  top="1vh"
	  right="1vw"
	  zIndex="100"
	  display="flex"
	>
	  <Logo />
	  <PunkIcon onClick={punkStep} />
	</VStack>
  );
};

export default TopRightComponent;
