import React from 'react';
import { createRoot } from 'react-dom/client';
import { TrailerViewer } from './features/viewer/TrailerViewer.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(<TrailerViewer />);
