import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ArScene from './components/ArScene';
import HomePage from './components/HomePage';
import TestPage from './components/TestPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/ar-image-1" element={
          <ArScene
            targetSrc="/target-image-1.jpg"
            materialSrc="https://upload.wikimedia.org/wikipedia/en/a/a9/Example.jpg"
          />
        }/>
        <Route path="/test" element={<TestPage />} /> {/* Add this line */}
      </Routes>
    </Router>
  );
}

export default App;