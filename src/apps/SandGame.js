import React, { useEffect } from "react";

function FallingSand() {
  useEffect(() => {
    // Dynamically load the JS files like shaders.js and main.js
    const loadScripts = () => {
      const shaderScript = document.createElement("script");
      shaderScript.src = "/SandGame/assets/js/shaders.js";
      shaderScript.async = true;
      document.body.appendChild(shaderScript);

      const mainScript = document.createElement("script");
      mainScript.src = "/SandGame/assets/js/main.js";
      mainScript.defer = true;
      document.body.appendChild(mainScript);
    };

    loadScripts();
  }, []);

  return (
    <>
      <div id="hero">
        <div id="canvas-container">
          <canvas id="main-canvas"></canvas>
          <h1 id="title">
            <span style={{ color: "rgb(160, 160, 161)" }}>Gelami</span>Salami
          </h1>
        </div>
        <div id="material-buttons">
          <ul>
            <li>
              <a href="#" data-type="0" title="Eraser (Key 0)"></a>
            </li>
            <li>
              <a href="#" data-type="1" title="Smoke (Key 1)"></a>
            </li>
            <li>
              <a href="#" data-type="2" title="Water (Key 2)"></a>
            </li>
            <li>
              <a href="#" data-type="3" title="Lava (Key 3)"></a>
            </li>
            <li>
              <a href="#" data-type="4" title="Sand (Key 4)"></a>
            </li>
            <li>
              <a href="#" data-type="5" title="Glitter (Key 5)"></a>
            </li>
            <li>
              <a href="#" data-type="6" title="Stone (Key 6)"></a>
            </li>
            <li>
              <a href="#" data-type="7" title="Wall (Key 7)"></a>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}

export default FallingSand;
