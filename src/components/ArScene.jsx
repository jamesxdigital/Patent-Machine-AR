import React, { useEffect } from 'react';

// Define the onWasmLoaded function globally so it can be called by simple-ar.min.js
window.onWasmLoaded = function() {
  console.log('WASM loaded by Simple-AR');
  // Additional initialization for Simple-AR if necessary
};

const ArScene = ({ targetSrc, materialSrc }) => {
  useEffect(() => {
    // Dynamically load the Simple-AR script if it's not already in the document
    if (!document.querySelector('script[src="https://cdn.jsdelivr.net/gh/akbartus/Simple-AR/dist/0.1.2/simple-ar.min.js"]')) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/gh/akbartus/Simple-AR/dist/0.1.2/simple-ar.min.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <a-scene embedded arjs='sourceType: webcam; debugUIEnabled: false;'>
      <a-assets>
        <img id="image" src={targetSrc} alt="Image Target" />
        <img id="material" src={materialSrc} alt="Material Image" />
      </a-assets>

      <a-entity simple-ar="src: #image; minCutOffValue: 1; betaValue:0.1;">
        <a-plane
          position="0 0 0"
          rotation="0 0 0"
          width="1"
          height="1"
          material="src: #material"
        ></a-plane>
      </a-entity>

      <a-camera position="0 0 0"></a-camera>
    </a-scene>
  );
};

export default ArScene;
