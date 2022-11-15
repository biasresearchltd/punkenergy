import React from 'react';
import { useColorMode, useColorModeValue, IconButton } from '@chakra-ui/react';
import { FaMoon, FaSun } from 'react-icons/fa';

export const ColorModeSwitcher = props => {
  const { toggleColorMode } = useColorMode();
  const text = useColorModeValue('dark', 'light');
  const SwitchIcon = useColorModeValue(FaMoon, FaSun);

  return (
    <IconButton
      backgroundColor="blue"
      size="md"
      fontSize="x-large"
      aria-label={`Switch to ${text} mode`}
      variant="solid"
      color="current"
      marginLeft="2"
      borderRadius="none"
      _hover={ { br: 'none', color: 'green', bgColor: 'pink' } }
      onClick={toggleColorMode}
      icon={<SwitchIcon />}
      {...props}
    />
  );
};