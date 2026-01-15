const vertex_shader = `
    attribute vec4 vertex_position;
	uniform float u_time;
    void main() {
      gl_Position = vertex_position + vec4(sin(u_time)/2.0,cos(u_time)/2.0,0.0,0.0);
    }
`;
const fragment_shader = `
	void main() {
      gl_FragColor = vec4(0.2, 1.0, 1.0, 1.0);
    }
`;

var sigma = 1.0;
main();

//buffers
function initBuffers(gl) {
  const positionBuffer = initPositionBuffer(gl);

  return {
    position: positionBuffer,
  };
}

function initPositionBuffer(gl) {
  const positionBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  const positions = [ 0.0,  0.5, 0.0,
  					 -0.5, -0.5, 0.0,
					  0.5, -0.5, 0.0 ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  return positionBuffer;
}


//shaders
function load_shader(gl, type, source) {
	const shader = gl.createShader(type);
	if (shader === null) console.log(source);
	if (shader === null) console.log(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	return shader;
}

function init_shader(gl, vsSource, fsSource) {
	const vertexShader = load_shader(gl, gl.VERTEX_SHADER, vsSource);
 	const fragmentShader = load_shader(gl, gl.FRAGMENT_SHADER, fsSource);

	const shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);	

	return shaderProgram;
}


//drow
function setPositionAttribute(gl, buffers, programInfo) {
  const numComponents = 3; // pull out 2 values per iteration
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
    offset,
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
}

function drawScene(gl, programInfo, buffers) {
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clearDepth(1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	setPositionAttribute(gl, buffers, programInfo);
	gl.useProgram(programInfo.program);
	//gl.uniform1f(programInfo.uniformLocations.u_time, Date.now().toFixed(2.0) / 1000.0);
	gl.uniform1f(programInfo.uniformLocations.u_time, sigma);
	sigma += 0.01;
	{
		const offset = 0;
		const vertexCount = 3;
		gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
	}
}

function main() {
	const canvas = document.querySelector("#gl-canvas");
	const gl = canvas.getContext("webgl");

	const buffers = initBuffers(gl);
	const main_shader = init_shader(gl, vertex_shader, fragment_shader);

	const programInfo = {
		program: main_shader,
		attribLocations: {
			vertexPosition: gl.getAttribLocation(main_shader, "vertex_position")
		},
		uniformLocations: {
			u_time: gl.getUniformLocation(main_shader, "u_time")
		}
	};
	drawScene(gl, programInfo, buffers);
	requestAnimationFrame(main);
}
