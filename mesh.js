class Mesh {
	buffers;
	vertex_count;

	draw(gl) {
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
	}
}
