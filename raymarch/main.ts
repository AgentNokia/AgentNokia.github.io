import { vec3, matr } from './mth.js';
import { camera } from './camera.js';
import { timer } from './timer.js';
// https://github.com/Eugeny/tabby
// https://michaelwalczyk.com/blog-ray-marching.html
// https://iquilezles.org/articles/distfunctions/

let gl: WebGL2RenderingContext;
let mouseX: number, mouseY: number;
let keyx = 0,
  keyy = 0,
  keyanglex = 0,
  keyangley = 0,
  mousewheel = 0;
let numOfSpheres = 1,
  numOfThorus = 0,
  numOfCubes = 0;
let events: any;
events = {};
let myTimer = new timer();

interface ProgramInfo {
  program: WebGLProgram;
  attribLocations: {
    vertexPosition: number;
    objectPosition: number;
  };
  // uniformLocations: {
  //   projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
  //   modelViewM atrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
  // },
}
// а тут теперь можно писать инструкции для любых комбинаций

function action () {
    if (events["ArrowLeft"]) keyanglex += 30 * myTimer.deltaTime; // <
	if (events["ArrowUp"]) keyangley += 30 * myTimer.deltaTime; // ^
    if (events["ArrowRight"]) keyanglex -= 30 * myTimer.deltaTime; // >
	if (events["ArrowDown"]) keyangley -= 30 * myTimer.deltaTime; // arrow down
    if (events["a"]) keyx -= 0.03;     // a
    if (events["d"]) keyx += 0.03;     // d
    if (events["s"]) keyy -= 0.03;     // s
    if (events["w"]) keyy += 0.03;     // W
}


function loadShader(type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(
      `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(vsSource: string, fsSource: string) {
  const vertexShader = loadShader(gl.VERTEX_SHADER, vsSource);
  if (!vertexShader) return;
  const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fsSource);
  if (!fragmentShader) return;

  // Create the shader program

  const shaderProgram = gl.createProgram();
  if (!shaderProgram) return;
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert(
      `Unable to initialize the shader program: ${gl.getProgramInfoLog(
        shaderProgram
      )}`
    );
    return null;
  }

  return shaderProgram;
}

function initPositionBuffer(): WebGLBuffer | null {
  // Create a buffer for the square's positions.
  const positionBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0]),
    gl.STATIC_DRAW
  );
  return positionBuffer;
}

function initObjectBuffer(positions: number[]): WebGLBuffer | null {
  const objectBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, objectBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  return objectBuffer;
}
function initUBO(positions: number[]): WebGLBuffer | null {
  const objectBuffer = gl.createBuffer();

  gl.bindBuffer(gl.UNIFORM_BUFFER, objectBuffer);
  gl.bufferData(gl.UNIFORM_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  gl.bindBufferBase(gl.UNIFORM_BUFFER, 0, objectBuffer);
  return objectBuffer;
}

interface Buffers {
  position: WebGLBuffer | null;
  object: WebGLBuffer | null;
}

function initBuffers(positions: number[]): Buffers {
  const positionBuffer = initPositionBuffer();
  const objectBuffer = initObjectBuffer(positions);

  return {
    position: positionBuffer,
    object: objectBuffer
  };
}

// Tell WebGL how to pull out the positions from the position
// buffer into the vertexPosition attribute.
function setPositionAttribute(buffers: Buffers, programInfo: ProgramInfo) {
  const numComponents = 2; // pull out 2 values per iteration
  const type = gl.FLOAT; // the data in the buffer is 32bit floats
  const normalize = false; // don't normalize
  const stride = 0; // how many bytes to get from one set of values to the next
  // 0 = use type and numComponents above
  const offset = 0; // how many bytes inside the buffer to start from
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexPosition,
    numComponents,
    type,
    normalize,
    stride,
    offset
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
}

async function reloadShaders(): Promise<ProgramInfo | null> {
  const vsResponse = await fetch(
    './march.vertex.glsl' + '?nocache' + new Date().getTime()
  );
  const vsText = await vsResponse.text();
  const fsResponse = await fetch(
    './frag1.glsl' + '?nocache' + new Date().getTime()
  );
  const fsText = await fsResponse.text();

  const shaderProgram = initShaderProgram(vsText, fsText);
  if (!shaderProgram) return null;

  const programInfo: ProgramInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'in_pos'),
      objectPosition: gl.getAttribLocation(shaderProgram, 'object')
    }
  };

  return programInfo;
}

export async function main() {
  // const BeginTime = Date.now();
  // BeginTime -= Date.now();

  const canvas = document.querySelector('#glcanvas') as HTMLCanvasElement;
  if (!canvas) {
    return;
  }
  // Initialize the GL context
  gl = canvas.getContext('webgl2') as WebGL2RenderingContext;

  // Only continue if WebGL is available and working
  if (gl === null) {
    alert(
      'Unable to initialize WebGL. Your browser or machine may not support it.'
    );
    return;
  }
  let cl = document.getElementById('clickMe');
  let cl1 = document.getElementById('clickMe1');
  if (cl)
    cl.onclick = function () {
      numOfSpheres++;
    };
  if (cl1)
    cl1.onclick = function () {
      numOfSpheres--;
    };
  let cl2 = document.getElementById('clickMe2');
  let cl3 = document.getElementById('clickMe3');
  if (cl2)
    cl2.onclick = function () {
      numOfThorus++;
    };
  if (cl3)
    cl3.onclick = function () {
      numOfThorus--;
    };
  let cl4 = document.getElementById('clickMe4');
  let cl5 = document.getElementById('clickMe5');
  if (cl4)
    cl4.onclick = function () {
      numOfCubes++;
    };
  if (cl5)
    cl5.onclick = function () {
      numOfCubes--;
    };
    // Set clear color to black, fully opaque
  gl.clearColor(0.0, 0.0, 0.5, 1.0);
  // Clear the color buffer with specified clear color
  gl.clear(gl.COLOR_BUFFER_BIT);

  let positions = [1, 0, 0, 0];
  let buffers = initBuffers(positions);
  const BeginTime = Date.now();
  // let uboData = initUBO([1, 0, 0, 0]);
  let cam = new camera();
  // cam.set()
  let programInfo = await reloadShaders();
  let time = myTimer.globalTime;

  let a = new vec3(0, 0, -5);
  // drawScene(programInfo, buffers, BeginTime);
  const draw = async () => {
    // myTimer.FPS = 30;
    myTimer.response();

    if (time + 3 < myTimer.time) {
      programInfo = await reloadShaders();
      time = myTimer.time;
    }
    if (!programInfo) {
      return;
    }

    let program = programInfo.program;
    // mousePos = myCalculateMousePosition(canvas, event);

    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
    gl.clearDepth(1.0); // Clear everything
    gl.enable(gl.DEPTH_TEST); // Enable depth testing
    gl.depthFunc(gl.LEQUAL); // Near things obscure far things

    // Clear the canvas before we start drawing on it.

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height
    // ratio that matches the display size of the canvas
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.

    // buffer into the vertexPosition attribute.
    setPositionAttribute(buffers, programInfo);

    const uniformLoc = gl.getUniformLocation(program, 'time');
    const uniformLoc1 = gl.getUniformLocation(program, 'Loc');
    const uniformAnglex = gl.getUniformLocation(program, 'AngleX');
    const uniformAngley = gl.getUniformLocation(program, 'AngleY');
    const uniformZoom = gl.getUniformLocation(program, 'zoom');
    const uniformNumber = gl.getUniformLocation(program, 'sphere_count');
    const uniformThor = gl.getUniformLocation(program, 'thorus_count');
    const uniformCube = gl.getUniformLocation(program, 'cubes_count');
    const timeFromStart = Date.now() - BeginTime;

    // Tell WebGL to use our program when drawing
    gl.useProgram(programInfo.program);
    gl.uniform1f(
      uniformLoc,
      Math.abs(Math.sin(timeFromStart / 1000.0) * 5) + 1.2
    );
    action();

    gl.uniform1f(uniformAnglex, keyanglex);
    gl.uniform1f(uniformAngley, keyangley);
    gl.uniform1f(uniformZoom, mousewheel);
    gl.uniform1i(uniformNumber, numOfSpheres);
    gl.uniform1i(uniformThor, numOfThorus);
    gl.uniform1i(uniformCube, numOfCubes);
    // let a = new vec3(
    //   (-mouseX / canvas.width) * 4 + 2,
    //   (mouseY / canvas.height) * 4 - 0,
    //   -5
    // );
    let b = new vec3(keyx * 10, keyy * 10, -5);
    let v = a.add(b.sub(a).mul(myTimer.deltaTime));
    // a = new vec3(keyx * 10, keyy * 10, -5);
    a = v;
    // a = new matr(null).setRotate(keyanglex, new vec3(1, 0, 0)).transform(a);
    cam.set(a, new vec3(0, 0, 0), new vec3(0, 1, 0));
    gl.uniform3fv(uniformLoc1, new Float32Array([a.x, a.y, a.z]));

    {
      const offset = 0;
      const vertexCount = 4;
      gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
    }

    let t = document.getElementById('fps') as HTMLParagraphElement;
    if (t != null) t.innerHTML = myTimer.FPS.toString();

    // positions = [-100, -100, 0, 0];
    // buffers = initBuffers(positions);
    // setPositionAttribute(buffers, programInfo);
    // {
    //     const offset = 0;
    //     const vertexCount = 4;
    //     gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
    // }

    window.requestAnimationFrame(draw);
  };
  draw();
  let myCalculateMousePosition = (
    canvas: HTMLCanvasElement,
    event: MouseEvent
  ) => {
    let rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - Math.trunc(rect.left),
      y: event.clientY - Math.trunc(rect.top)
    };
  };
  document.addEventListener('keydown', (event) => {
  	events[event.key] = true;
  });

  document.addEventListener('keyup', (event) => {
  	events[event.key] = false; 
  });
/*   window.addEventListener('keydown', (event) => {
    if (event.key == 'w') {
        keyy += 0.03;
      } else if (event.key == 's') {
        keyy -= 0.03;
      }
  });
  window.addEventListener('keydown', (event) => {
    if (event.key == 'ArrowUp') {
      keyangley -= 0.3;
    } else if (event.key == 'ArrowDown') {
      keyangley += 0.3;
    }
  });
  window.addEventListener('keydown', (event) => {
    if (event.key == 'ArrowLeft') {
      keyanglex -= 0.3;
    } else if (event.key == 'ArrowRight') {
      keyanglex += 0.3;
    }
  });
  window.addEventListener('keydown', (event) => {
    if (event.key == 'a') {
      keyx -= 0.03;
    } else if (event.key == 'd') {
      keyx += 0.03;
    }
  }); */
  window.addEventListener('mousemove', (event) => {
    let mousePos = myCalculateMousePosition(canvas, event);
    mouseX = mousePos.x;
    mouseY = mousePos.y;
  });
  window.addEventListener('wheel', (event) => {
    mousewheel -= event.deltaY / 2;
    // (zoomx0 += event.deltaY / 100 / (canvas.width - mouseX)),
    // (zoomy0 += event.deltaY / 100 / mouseY),
    // (zoomx1 += event.deltaY / 100 / mouseX),
    // (zoomy1 += event.deltaY / 100 / (canvas.width - mouseY));
  });
}

window.addEventListener('load', () => {
  main();
});
