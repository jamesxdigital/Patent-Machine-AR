import React, { useEffect } from 'react';

const ArScene = ({ targetSrc, materialSrc }) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/gh/akbartus/Simple-AR/dist/0.1.2/simple-ar.min.js";
    script.onload = () => onWasmLoaded(); // Ensure onWasmLoaded is defined or remove this line if not needed
    document.body.appendChild(script);

    // Clean up the script when the component unmounts
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Make sure this function does what you need, or remove it if not used.
  function onWasmLoaded() {
    console.log('Simple-AR loaded');
    // Initialization code for Simple-AR can go here
  }

  return (
    <a-scene>
      <a-assets>
        <img id="image" src={targetSrc} alt="target" />
        <img id="material" src={materialSrc} alt="material" />
      </a-assets>

      <a-entity simple-ar={`src: #image; minCutOffValue: 1; betaValue:0.1;`}>
        <a-plane
          position="0 0 0"
          rotation="0 0 0"
          width="1"
          height="1"
          material={`src: #material`}
        ></a-plane>
      </a-entity>

      <a-camera position="0 0 0"></a-camera>
    </a-scene>
  );
};

export default ArScene;
