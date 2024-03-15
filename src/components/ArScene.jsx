import React from 'react';

const ArScene = ({ targetSrc, materialSrc }) => {
  // No need for useEffect to load scripts since they are included in index.html

  return (
    <a-scene>
      <a-entity simple-ar="src: target-image-1.jpg; minCutOffValue: 1; betaValue:0.1;">
        <a-plane
          position="0 0 0"
          rotation="0 0 0"
          width="1"
          height="1"
          material="src: https://upload.wikimedia.org/wikipedia/en/a/a9/Example.jpg"
        ></a-plane>
      </a-entity>
      <a-camera position="0 0 0"></a-camera>
    </a-scene>
  );
};

export default ArScene;
