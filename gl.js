const vertex_shader = `
    attribute vec4 vertex_position;
	varying vec4 shared_vertex;

	uniform mat4 proj;
	uniform mat4 view;
	uniform mat4 model;
    
	void main() {
		shared_vertex = vertex_position;
		gl_Position = proj * view * model * vertex_position;
    }
`;
const fragment_shader = `
	precision mediump float;
	varying vec4 shared_vertex;
	
	uniform vec3 light_dir;

	void main() {
		gl_FragColor = vec4(0.2, 1.0, 1.0, 1.0);
    }
`;

let sigma = 0.0;

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

  //const positions = [ 0.0,  0.5, 0.0, 
  //				   -0.5, -0.5, 0.0,
  //				    0.5, -0.5, 0.0 ];
  
  const positions = [
    -1.0, 1.0, 1.0,     // Front-top-le0t
    1.0, 1.0, 1.0,      // Front-top-right
    -1.0, -1.0, 1.0,    // Front-bottom-le0t
    1.0, -1.0, 1.0,     // Front-bottom-right
    1.0, -1.0, -1.0,    // Back-bottom-right
    1.0, 1.0, 1.0,      // Front-top-right
    1.0, 1.0, -1.0,     // Back-top-right
    -1.0, 1.0, 1.0,     // Front-top-le0t
    -1.0, 1.0, -1.0,    // Back-top-le0t
    -1.0, -1.0, 1.0,    // Front-bottom-le0t
    -1.0, -1.0, -1.0,   // Back-bottom-le0t
    1.0, -1.0, -1.0,    // Back-bottom-right
    -1.0, 1.0, -1.0,    // Back-top-le0t
    1.0, 1.0, -1.0      // Back-top-right
  ];

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

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	setPositionAttribute(gl, buffers, programInfo);
	gl.useProgram(programInfo.program);
	
	sigma += 0.01;

	let proj = glMatrix.mat4.create();
	let view = glMatrix.mat4.create();
	let model = glMatrix.mat4.create();
	glMatrix.mat4.perspectiveNO(proj, 1.3, 1280/720, 0.1, 100.0);
	glMatrix.mat4.translate(view, view, [0,0,-3]);
	glMatrix.mat4.rotateX(model, model, sigma);
	glMatrix.mat4.rotateY(model, model, sigma/2);

	gl.uniformMatrix4fv(programInfo.uniformLocations.proj, false, proj);
	gl.uniformMatrix4fv(programInfo.uniformLocations.view, false, view);
	gl.uniformMatrix4fv(programInfo.uniformLocations.model, false, model);
	
	gl.uniform3f(programInfo.uniformLocations.light_dir, 0.41, -0.82, 0.41);

	{
		const offset = 0;
		const vertexCount = 14;
		gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
	}
}

function main() {
	const canvas = document.querySelector("#gl-canvas");
	const gl = canvas.getContext("webgl");

	gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.BACK);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);

	const buffers = initBuffers(gl);
	const main_shader = init_shader(gl, vertex_shader, fragment_shader);

	const programInfo = {
		program: main_shader,
		attribLocations: {
			vertexPosition: gl.getAttribLocation(main_shader, "vertex_position")
		},
		uniformLocations: {
			proj: gl.getUniformLocation(main_shader, "proj"),
			view: gl.getUniformLocation(main_shader, "view"),
			model: gl.getUniformLocation(main_shader, "model"),
			
			light_dir: gl.getUniformLocation(main_shader, "light_dir")
		}
	};
	drawScene(gl, programInfo, buffers);
	requestAnimationFrame(main);
}
