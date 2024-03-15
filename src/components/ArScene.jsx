import React from 'react';

const ArScene = ({ targetSrc, materialSrc }) => {
  // No need for useEffect to load scripts since they are included in index.html

  return (
    <a-scene>
      <a-assets>
        <img id="image" src={targetSrc} />
        <img id="material" src={materialSrc} />
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
