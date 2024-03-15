import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ArScene from './components/ArScene';
import HomePage from './components/HomePage'; // Import the HomePage component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} /> {/* Set HomePage as the root route */}
        <Route path="/ar-image-1" element={
          <ArScene
            targetSrc="/target-image-1.jpg"
            materialSrc="https://upload.wikimedia.org/wikipedia/en/a/a9/Example.jpg"
          />
        }/>
        {/* You can add more routes with different targets and materials */}
      </Routes>
    </Router>
  );
}

export default App;
