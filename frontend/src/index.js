import React from 'react';
import ReactDOM from 'react-dom/client';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import Play from './pages/play';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <div className='App-header'>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/play" element={<Play />}/>
        </Routes>
      </BrowserRouter>
    </div>
  </React.StrictMode>
);
