import React, { useEffect } from 'react';

const loadScript = (src, onLoad) => {
  const script = document.createElement('script');
  script.src = src;
  script.onload = onLoad;
  document.head.appendChild(script);
};

const ArScene = ({ targetSrc, materialSrc }) => { // Accepting props here
  useEffect(() => {
    // Load A-Frame
    loadScript('https://aframe.io/releases/1.4.2/aframe.min.js', () => {
      console.log('A-Frame loaded');

      // Load Simple-AR after A-Frame
      loadScript('https://cdn.jsdelivr.net/gh/akbartus/Simple-AR/dist/0.1.2/simple-ar.min.js', () => {
        console.log('Simple-AR loaded');
        // If there's a function that needs to be called after the script is loaded,
        // it should be defined outside of this component or passed in as a prop.
      });
    });

    // Optionally remove scripts on component unmount
    return () => {
      // This function will be executed when the component unmounts
      // Here you would clean up any dynamic scripts if necessary
    };
  }, []); // Empty dependency array means this effect will only run once on mount

  return (
    <a-scene>
      <a-entity simple-ar={`src: ${targetSrc}; minCutOffValue: 1; betaValue:0.1;`}>
        <a-plane
          position="0 0 0"
          rotation="0 0 0"
          width="1"
          height="1"
          material={`src: ${materialSrc}`}
        ></a-plane>
      </a-entity>
      <a-camera position="0 0 0"></a-camera>
    </a-scene>
  );
};

export default ArScene;