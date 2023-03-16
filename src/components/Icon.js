import React from "react";
import IconImage from "../icons/PunkIcon-24.png";
import styled from 'styled-components';

const Container = styled.div`
  display: inline-block;
  width: 64px;
  height: 64px;
  cursor: pointer;
  margin: 0;
  padding: 0;
  image-rendering: pixelated;
`;

const Image = styled.img`
  width: 64px;
  height: 64px;
  user-drag: none;
  user-select: none;
`;

const Icon = ({ onClick }) => (
  <Container onClick={onClick}>
	  <Image src={IconImage} width="64px" height="64px" />
  </Container>
);

export default Icon;