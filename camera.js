function radians(deg) {
	return deg * (Math.PI / 180);
}

class Camera {
	position;
	dir;
	up;

	yaw; pitch;

	sensitivity;

	handle_mouse_input(x, y) {
		this.yaw += x * this.sensitivity;
		this.pitch -= y * this.sensitivity;

		if (this.pitch > 89.0) this.pitch = 89.0;
		if (this.pitch < -89.0) this.pitch = -89.0;

		this.dir[0] = Math.cos(radians(this.yaw)) * Math.cos(radians(this.pitch));
		this.dir[1] = Math.sin(radians(this.pitch));
		this.dir[2] = Math.sin(radians(this.yaw)) * Math.cos(radians(this.pitch));
		glMatrix.vec3.normalize(this.dir, this.dir);
	}
	
	constructor() {
		this.sensitivity = 0.1;

		this.yaw = 0.0;
		this.pitch = 0.0;

		this.position = glMatrix.vec3.fromValues(0,0,0);
		this.dir = glMatrix.vec3.fromValues(0,0,0);
		this.up = glMatrix.vec3.fromValues(0,1,0);
	}

	get_view() {
		let ret = glMatrix.mat4.create();
		let pos = glMatrix.vec3.create();
		glMatrix.vec3.add(pos, this.position, this.dir);
		glMatrix.mat4.lookAt(ret, this.position, pos, this.up);
		return ret;
	}
}
