const vertex_shader = `
    attribute vec3 vertex_position;
    attribute vec3 normal_position;

	varying vec3 shared_normal;

	uniform mat4 proj;
	uniform mat4 view;
	uniform mat4 model;
	

	void main() {
		shared_normal = normalize(model * vec4(normal_position,1.0)).xyz;
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

let ktime = 0.0;

main();

function clear(gl) {
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clearDepth(1.0);
	
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function main() {
	const canvas = document.querySelector("#gl-canvas");
	const gl = canvas.getContext("webgl");
	gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.BACK);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);

	ktime += 0.01;

	let proj = glMatrix.mat4.create();
	let view = glMatrix.mat4.create();
	let model = glMatrix.mat4.create();
	glMatrix.mat4.perspectiveNO(proj, 1.3, 1280/720, 0.1, 100.0);
	glMatrix.mat4.translate(view, view, [0,0,-3]);
	glMatrix.mat4.rotateX(model, model, ktime);
	glMatrix.mat4.rotateY(model, model, ktime/2);
	glMatrix.mat4.rotateZ(model, model, ktime/4);

	let cube_shader = new Shader(gl, vertex_shader, fragment_shader);
	let cube_mesh = new Mesh(gl, cube_vertices);

	clear(gl);
	cube_shader.set_attribute(gl, cube_mesh.buffers.vertex);
	cube_shader.use(gl);
	
	cube_shader.set_uniform_mat4(gl, "proj", proj);
	cube_shader.set_uniform_mat4(gl, "view", view);
	cube_shader.set_uniform_mat4(gl, "model", model);
	cube_shader.set_uniform_vec3(gl, "light_dir", 0.0, 0.0, 1.0);

	cube_mesh.draw(gl);

	requestAnimationFrame(main);
}
