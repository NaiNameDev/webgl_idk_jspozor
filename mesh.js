class Mesh {
	position;
	rotation;
	scale;

	buffers;
	vertex_count;

	draw(gl, shader) {
		let model = glMatrix.mat4.create();
		glMatrix.mat4.translate(model, model, this.position);
		glMatrix.mat4.rotateX(model, model, this.rotation[0]);
		glMatrix.mat4.rotateY(model, model, this.rotation[1]);
		glMatrix.mat4.rotateZ(model, model, this.rotation[2]);
		glMatrix.mat4.scale(model, model, this.scale);
		
		shader.set_uniform_mat4(gl, "model", model);
		
		gl.drawArrays(gl.TRIANGLES, 0, this.vertex_count);
	}

	create_vertex_buffer(gl, vertices) {
		const tmp_vertex_buffer = gl.createBuffer();
		
		gl.bindBuffer(gl.ARRAY_BUFFER, tmp_vertex_buffer);
		if (vertices.length % 3 != 0) alert("YOU STUPID (bad Mesh vertices size)");
		this.vertex_count = (vertices.length / 3) / 2;
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

		this.buffers["vertex"] = tmp_vertex_buffer
	}

	constructor(gl, vertices, normals) {
		this.buffers = {};
		this.create_vertex_buffer(gl, vertices);
		this.position = glMatrix.vec3.fromValues(0,0,0);
		this.rotation = glMatrix.vec3.fromValues(0,0,0);
		this.scale = glMatrix.vec3.fromValues(1,1,1);
	}
}
