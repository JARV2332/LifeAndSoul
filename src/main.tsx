import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import LifeAndSoulApp from './LifeAndSoulApp';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LifeAndSoulApp />
  </StrictMode>
);
