import React from 'react';
import { Link } from 'react-router-dom';

const SVGButton = ({ to, children }) => (
  <Link to={to}>
    <svg className="SVGButton">
      {children}
    </svg>
  </Link>
);

export default SVGButton;
