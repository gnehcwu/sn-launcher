import React from 'react';
import { Spinner } from './Loader.styles';

interface LoaderProps {
  children?: React.ReactNode;
  className?: string;
  size?: number;
  stroke?: number;
  speed?: number;
}

function Loader({ children, size = 18, stroke = 1, speed=1, ...delegated }: LoaderProps) {
  return (
    <Spinner size={size} stroke={stroke} speed={speed} {...delegated} />
  );
}

export default Loader;
