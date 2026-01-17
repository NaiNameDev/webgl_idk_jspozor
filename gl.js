const vertex_shader = `
    attribute vec3 vertex_position;
    attribute vec3 normal_position;

	varying vec3 shared_normal;

	uniform mat4 proj;
	uniform mat4 view;
	uniform mat4 model;
	

	void main() {
		shared_normal = mat3(model) * normal_position;
		gl_Position = proj * view * model * vec4(vertex_position,1.0);
    }
`;
const fragment_shader = `
	precision mediump float;

	varying vec3 shared_normal;
	
	uniform vec3 light_dir;
	
	void main() {
		float diff = max(dot(shared_normal.xyz, normalize(light_dir.xyz)), 0.0);
		gl_FragColor = vec4(diff + 0.1, diff + 0.1, diff + 0.1, 1.0);
    }
`;

const cube_vertices = [
    -1, -1,  1,  0, 0, 1,
     1, -1,  1,  0, 0, 1,
     1,  1,  1,  0, 0, 1,
    
    -1, -1,  1,  0, 0, 1,
     1,  1,  1,  0, 0, 1,
    -1,  1,  1,  0, 0, 1,
    
    -1, -1, -1,  0, 0, -1,
    -1,  1, -1,  0, 0, -1,
     1,  1, -1,  0, 0, -1,
    
    -1, -1, -1,  0, 0, -1,
     1,  1, -1,  0, 0, -1,
     1, -1, -1,  0, 0, -1,
    
    -1,  1, -1,  0, 1, 0,
    -1,  1,  1,  0, 1, 0,
     1,  1,  1,  0, 1, 0,
    
    -1,  1, -1,  0, 1, 0,
     1,  1,  1,  0, 1, 0,
     1,  1, -1,  0, 1, 0,
    
    -1, -1, -1,  0, -1, 0,
     1, -1, -1,  0, -1, 0,
     1, -1,  1,  0, -1, 0,
    
    -1, -1, -1,  0, -1, 0,
     1, -1,  1,  0, -1, 0,
    -1, -1,  1,  0, -1, 0,
    
     1, -1, -1,  1, 0, 0,
     1,  1, -1,  1, 0, 0,
     1,  1,  1,  1, 0, 0,
    
     1, -1, -1,  1, 0, 0,
     1,  1,  1,  1, 0, 0,
     1, -1,  1,  1, 0, 0,
    
    -1, -1, -1,  -1, 0, 0,
    -1, -1,  1,  -1, 0, 0,
    -1,  1,  1,  -1, 0, 0,
    
    -1, -1, -1,  -1, 0, 0,
    -1,  1,  1,  -1, 0, 0,
    -1,  1, -1,  -1, 0, 0
];



//input
document.body.style.cursor = 'none';
let current_camera = new Camera();

let speed = 0.08;

let holded_keys = {};
document.addEventListener('keyup', onKeyUp, false);
document.addEventListener('keydown', onKeyDown, false);
function onKeyUp(event) {
    if (event.key === 's') holded_keys[event.code] = false;
    if (event.key === 'a') holded_keys[event.code] = false;
    if (event.key === 'w') holded_keys[event.code] = false;
    if (event.key === 'd') holded_keys[event.code] = false;
}
function onKeyDown(event) {
    if (event.key === 's') holded_keys[event.code] = true;
    if (event.key === 'a') holded_keys[event.code] = true;
    if (event.key === 'w') holded_keys[event.code] = true;
    if (event.key === 'd') holded_keys[event.code] = true;
}

document.addEventListener('mousemove', mouse_handle, false);
function mouse_handle(event) {
	const x = event.movementX;
	const y = event.movementY;
	
	current_camera.handle_mouse_input(x, y);
}



function clear(gl) {
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clearDepth(1.0);
	
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

//globals
let proj = glMatrix.mat4.create();
glMatrix.mat4.perspectiveNO(proj, 1.3, 1280/720, 0.1, 100.0);

const canvas = document.querySelector("#gl-canvas");
canvas.addEventListener("click", async () => {
  await canvas.requestPointerLock();
});
const gl = canvas.getContext("webgl");

gl.enable(gl.CULL_FACE);
gl.cullFace(gl.BACK);
gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LEQUAL);

let cube_shader = new Shader(gl, vertex_shader, fragment_shader);
let cube_mesh = new Mesh(gl, cube_vertices);
cube_mesh.position = glMatrix.vec3.fromValues(0,0,-7);

cube_shader.set_attribute(gl, cube_mesh.buffers.vertex);

main();

function main() {
	//input handle

	if (holded_keys['KeyS']) {
		let pos_change = glMatrix.vec3.create();
		glMatrix.vec3.scale(pos_change, current_camera.dir, speed);
    	glMatrix.vec3.subtract(current_camera.position, current_camera.position, pos_change);
	}
	if (holded_keys['KeyW']) {
		let pos_change = glMatrix.vec3.create();
		glMatrix.vec3.scale(pos_change, current_camera.dir, speed);
    	glMatrix.vec3.add(current_camera.position, current_camera.position, pos_change);
	}
	if (holded_keys['KeyA']) {
		let cross = glMatrix.vec3.create();
		glMatrix.vec3.cross(cross, current_camera.dir, current_camera.up);
		glMatrix.vec3.normalize(cross, cross);
		glMatrix.vec3.scale(cross, cross, speed);
    	glMatrix.vec3.subtract(current_camera.position, current_camera.position, cross);
	}
	if (holded_keys['KeyD']) {
		let cross = glMatrix.vec3.create();
		glMatrix.vec3.cross(cross, current_camera.dir, current_camera.up);
		glMatrix.vec3.normalize(cross, cross);
		glMatrix.vec3.scale(cross, cross, speed);
    	glMatrix.vec3.add(current_camera.position, current_camera.position, cross);
	}

	//drawing
	clear(gl);
	cube_shader.use(gl);
	
	let view = current_camera.get_view();
	
	cube_shader.set_uniform_mat4(gl, "proj", proj);
	cube_shader.set_uniform_mat4(gl, "view", view);
	
	cube_shader.set_uniform_vec3(gl, "light_dir", 0.0, 0.0, 1.0);

	cube_mesh.draw(gl, cube_shader);

	requestAnimationFrame(main);
}
