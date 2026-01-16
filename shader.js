class Shader {
	shader_program;

	load_shader(gl, type, source) {
		const shader = gl.createShader(type);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		return shader;
	}

	constructor(gl, vs_source, fs_source) {
		const vertex_shader = this.load_shader(gl, gl.VERTEX_SHADER, vs_source);
 		const fragment_shader = this.load_shader(gl, gl.FRAGMENT_SHADER, fs_source);

		const out_shader = gl.createProgram();
		gl.attachShader(out_shader, vertex_shader);
		gl.attachShader(out_shader, fragment_shader);
		gl.linkProgram(out_shader);	

		this.shader_program = out_shader;
	}

	use(gl) {
		gl.useProgram(this.shader_program);
	}

	set_attribute(gl, buffer) {
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);
		gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 12);
		gl.enableVertexAttribArray(0);
		gl.enableVertexAttribArray(1);
	}

	set_uniform_float(gl, name, val) {
		gl.uniform1f(gl.getUniformLocation(this.shader_program, name), val);
	}
	set_uniform_mat4(gl, name, val) {
		let link = gl.getUniformLocation(this.shader_program, name);
		gl.uniformMatrix4fv(link, false, val);
	}
	set_uniform_vec3(gl, name, val1, val2, val3) {
		gl.uniform3f(gl.getUniformLocation(this.shader_program, name), val1, val2, val3);
	}
}
