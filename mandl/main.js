let zoomx0 = 1,
  zoomy0 = 1,
  zoomx1 = 1,
  zoomy1 = 1,
  mousewheel = 0,
  mousePos; 

function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert("!!!");
  }
  return shader;
}

function initGL() {
  const canvas = document.getElementById("glCanvas");
  const gl = canvas.getContext("webgl2");

  gl.clearColor(1, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  const vs = `#version 300 es
      in highp vec4 in_pos;

      void main() {
         gl_Position = in_pos;
      } 
   `;
  const fs = `#version 300 es
      out highp vec4 o_color;
      uniform highp float time, posx0, posy1, posx1, posy0;

      highp vec2 CMPLMul( highp vec2 A, highp vec2 B )
      {
        highp vec2 Z;
        Z = vec2(A.x * B.x - A.y * B.y, A.x * B.y + B.x * A.y);
        return Z;
      }
      
      highp float Mandelbrot( highp vec2 Z, highp vec2 C )
      {
        highp float n;
        
        for (n = 0.0; n < 255.0 && (Z.x * Z.x + Z.y * Z.y) < 4.0; n += 1.0)
          Z = CMPLMul(Z, Z) + C;
        return n;
      }

      void main() {
         highp float x0 = -1.0 * posx0, x1 = 1.0 * posx1, y0 = -1.0 * posy0, y1 = 1.0 * posy1;
         highp float n = time;
         highp vec2 Z;
         //highp vec2 c = vec2(0.35 + 0.08 * sin(time + 3), 0.39 + 0.08 * sin(1.1 * time));


         Z = vec2((x0 + gl_FragCoord.x * (x1 - x0) / 1000.0), (y0 + gl_FragCoord.y * (y1 - y0) / 1000.0));
         n = Mandelbrot(Z, Z);
         o_color = vec4(n / 255.0, n / 5.0 / 255.0, n * 30.0 / 255.0, 1.0);
      }
   `;

  const vertexSh = loadShader(gl, gl.VERTEX_SHADER, vs);
  const fragmentSh = loadShader(gl, gl.FRAGMENT_SHADER, fs);

  const program = gl.createProgram();
  gl.attachShader(program, vertexSh);
  gl.attachShader(program, fragmentSh);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    alert("!!!");
  }

  const draw = () => {
    const BeginTime = Date.now();
    const posLoc = gl.getAttribLocation(program, "in_pos");
    const uniformLoc = gl.getUniformLocation(program, "time");
    const uniformPosx0 = gl.getUniformLocation(program, "posx0");
    const uniformPosy0 = gl.getUniformLocation(program, "posy0");
    const uniformPosx1 = gl.getUniformLocation(program, "posx1");
    const uniformPosy1 = gl.getUniformLocation(program, "posy1");

    const timeFromStart = Date.now() - BeginTime;
    const posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    const pos = [-1, 1, 0, 1, 1, 1, 1, 1, -1, -1, 0, 1, 1, -1, 1, 1];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);
    gl.vertexAttribPointer(posLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(posLoc);
    gl.useProgram(program);
    gl.uniform1f(uniformLoc, timeFromStart / 1000.0);
    gl.uniform1f(uniformPosx0, zoomx0);
    gl.uniform1f(uniformPosy0, zoomy0);
    gl.uniform1f(uniformPosx1, zoomx1);
    gl.uniform1f(uniformPosy1, zoomy1);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 6);
    window.requestAnimationFrame(draw);
  };
  draw();
  let myCalculateMousePosition = (canvas, event) => {
    let rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - Math.trunc(rect.left),
      y: event.clientY - Math.trunc(rect.top),
    };
  };
  window.addEventListener("wheel", (event) => {
    mousePos = myCalculateMousePosition(canvas, event);
    (mousewheel += event.deltaY),
      (zoomx0 += event.deltaY / 100 / (canvas.width - mousePos.x)),
      (zoomy0 += event.deltaY / 100 / mousePos.x),
      (zoomx1 += event.deltaY / 100 / mousePos.x),
      (zoomy1 += event.deltaY / 100 / (canvas.width - mousePos.x));
  });
}
window.addEventListener("load", () => {
  document.body.onkeydown = function (e) {
    //if (e.code == "ArrowUp") (zoomx = zoomx / 1.1), (zoomy = zoomy / 1.1);
    //if (e.code == "ArrowDown") (zoomx = zoomx * 1.1), (zoomy = zoomy * 1.1);
    if (e.code) zoomx = 1;
  };
  initGL();
});
// module.exports = initGL;
