interface WebGLType {
  name: string;
  length: number;
}

interface WebGLParamDefinition {
  name: string;
  type: WebGLType;
}

interface WebGLParamValue {
  name: string;
  value: Float32Array;
}

interface WebGLBufferMap {
  [name: string]: WebGLBuffer;
}

export class WebGLComputation {
  private readonly width: number;
  private readonly height: number;
  private readonly gl: WebGLRenderingContext;
  private readonly program: WebGLProgram;

  private readonly attributeDefinitions: WebGLParamDefinition[] = [];
  private readonly uniformDefinitions: WebGLParamDefinition[] = [];

  private readonly attributeBuffers: WebGLBufferMap = {};
  private readonly uniformBuffers: WebGLBufferMap = {};

  constructor(
    private readonly size: number,
    attributes: WebGLParamDefinition[],
    uniforms: WebGLParamDefinition[],
    functionSource: string
  ) {
    // Calculate canvas size
    {
      let w = 1;
      let h = 1;
      while (w * h < size) {
        if (w <= h) {
          w *= 2;
        } else {
          h *= 2;
        }
      }
      this.width = w;
      this.height = h;
    }

    // Create the WebGL context
    {
      const canvas = document.createElement("canvas");
      canvas.width = this.width;
      canvas.height = this.height;
      const gl = canvas.getContext("webgl");
      if (!gl) throw new Error("An error occurred creating the WebGL context.");
      this.gl = gl;
    }

    // Create the shaders
    {
      const attributeString = attributes
        .map((attr) => `attribute ${attr.type.name} ${attr.name};`)
        .join("\n");

      const uniformString = uniforms
        .map((uniform) => `uniform ${uniform.type.name} ${uniform.name};`)
        .join("\n");

      const vertexShaderSource = `
      attribute float aIndex;
      attribute vec2 aPosition;
      ${attributeString}
      ${uniformString}
      varying vec4 vOutput;

      void main() {
          gl_Position = vec4(aPosition, 0.5, 1.0);
          gl_PointSize = 1.0;
          ${functionSource}
      }
      `;

      const vertexShader = this.createShader(
        this.gl.VERTEX_SHADER,
        vertexShaderSource
      );

      const fragmentShader = this.createShader(
        this.gl.FRAGMENT_SHADER,
        `
        precision mediump float;
        varying vec4 vOutput;
        void main() {
            gl_FragColor = vOutput;
        }
    `
      );

      // Create the program
      const program = this.gl.createProgram();
      if (!program) throw new Error("An error occurred creating the program.");
      this.gl.attachShader(program, vertexShader);
      this.gl.attachShader(program, fragmentShader);
      this.gl.linkProgram(program);
      if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
        throw new Error(
          "Unable to initialize the shader program: " +
            this.gl.getProgramInfoLog(program)
        );
      }
      this.program = program;
    }

    // Initialize default attributes
    {
      const positionAttribute = {
        name: "aPosition",
        type: WEBGL_TYPE.VEC2,
      };
      this.registerAttribute(positionAttribute);
      const positions = new Float32Array(this.size * 2);
      positions.fill(0);
      const hW = this.width / 2;
      const hH = this.height / 2;
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          if ((y * this.width + x) * 2 + 1 >= this.size * 2) break;
          positions[(y * this.width + x) * 2] = (2 * (x - hW) + 1) / this.width;
          positions[(y * this.width + x) * 2 + 1] =
            (2 * (y - hH) + 1) / this.height;
        }
      }
      this.setAttribute({ name: "aPosition", value: positions });

      const indexAttribute = {
        name: "aIndex",
        type: WEBGL_TYPE.FLOAT,
      };
      this.registerAttribute(indexAttribute);
      const indices = new Float32Array(this.size);
      for (let i = 0; i < this.size; i++) indices[i] = i;
      this.setAttribute({ name: "aIndex", value: indices });
    }

    // Initialize other attributes
    for (const attribute of attributes) {
      this.registerAttribute(attribute);
    }

    // Use the program
    this.gl.useProgram(this.program);

    // Initialize uniforms
    for (const uniform of uniforms) {
      this.registerUniform(uniform);
    }
  }

  private registerAttribute(attribute: WebGLParamDefinition) {
    // Check if the attribute already exists
    if (this.attributeDefinitions.find((a) => a.name === attribute.name)) {
      throw new Error("The attribute already exists.");
    }

    // Check if uniform with the same name exists
    if (this.uniformDefinitions.find((u) => u.name === attribute.name)) {
      throw new Error("An attribute with the same name as a uniform exists.");
    }

    const data = new Float32Array(this.size * attribute.type.length);
    data.fill(0);

    const buffer = this.gl.createBuffer();
    if (!buffer) throw new Error("An error occurred creating the buffer.");
    this.attributeBuffers[attribute.name] = buffer;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.STATIC_DRAW);
    const location = this.gl.getAttribLocation(this.program, attribute.name);
    this.gl.enableVertexAttribArray(location);
    this.gl.vertexAttribPointer(
      location,
      attribute.type.length,
      this.gl.FLOAT,
      false,
      0,
      0
    );
    this.attributeDefinitions.push(attribute);
  }

  private setAttribute(value: WebGLParamValue) {
    // Check if the buffer exists and the value is the correct length
    const attribute = this.attributeDefinitions.find(
      (a) => a.name === value.name
    );
    if (!attribute) throw new Error("An error occurred finding the attribute.");
    if (this.size * attribute.type.length !== value.value.length) {
      throw new Error(
        `Invalid attribute value length. Provided: ${
          value.value.length
        }, Expected: ${this.size * attribute.type.length}`
      );
    }

    const buffer = this.attributeBuffers[value.name];
    if (!buffer) throw new Error("An error occurred finding the buffer.");
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, value.value, this.gl.STATIC_DRAW);
    const location = this.gl.getAttribLocation(this.program, attribute.name);
    this.gl.vertexAttribPointer(
      location,
      attribute.type.length,
      this.gl.FLOAT,
      false,
      0,
      0
    );
    this.gl.enableVertexAttribArray(location);
  }

  private registerUniform(uniform: WebGLParamDefinition) {
    // Check if the uniform already exists
    if (this.uniformDefinitions.find((u) => u.name === uniform.name)) {
      throw new Error("The uniform already exists.");
    }

    // Check if attribute with the same name exists
    if (this.attributeDefinitions.find((a) => a.name === uniform.name)) {
      throw new Error("A uniform with the same name as an attribute exists.");
    }

    const data = new Float32Array(uniform.type.length);
    data.fill(0);
    const buffer = this.gl.createBuffer();
    if (!buffer) throw new Error("An error occurred creating the buffer.");
    this.uniformBuffers[uniform.name] = buffer;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.STATIC_DRAW);
    const location = this.gl.getUniformLocation(this.program, uniform.name);
    switch (uniform.type.length) {
      case 1:
        this.gl.uniform1f(location, 0);
        break;
      case 2:
        this.gl.uniform2f(location, 0, 0);
        break;
      case 3:
        this.gl.uniform3f(location, 0, 0, 0);
        break;
      case 4:
        this.gl.uniform4f(location, 0, 0, 0, 0);
        break;
      default:
        throw new Error("Invalid uniform value length.");
    }
    this.uniformDefinitions.push(uniform);
  }

  private setUniform(value: WebGLParamValue) {
    // Check if the buffer exists and the value is the correct length
    const uniform = this.uniformDefinitions.find((u) => u.name === value.name);
    if (!uniform) throw new Error("An error occurred finding the uniform.");
    if (uniform.type.length !== value.value.length) {
      throw new Error("Invalid uniform value length.");
    }

    const buffer = this.uniformBuffers[value.name];
    if (!buffer) throw new Error("An error occurred finding the buffer.");
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    const location = this.gl.getUniformLocation(this.program, value.name);
    switch (value.value.length) {
      case 1:
        this.gl.uniform1f(location, value.value[0]);
        break;
      case 2:
        this.gl.uniform2f(location, value.value[0], value.value[1]);
        break;
      case 3:
        this.gl.uniform3f(
          location,
          value.value[0],
          value.value[1],
          value.value[2]
        );
        break;
      case 4:
        this.gl.uniform4f(
          location,
          value.value[0],
          value.value[1],
          value.value[2],
          value.value[3]
        );
        break;
      default:
        throw new Error("Invalid uniform value length.");
    }
  }

  private createShader(type: number, source: string): WebGLShader {
    const shader = this.gl.createShader(type);
    if (!shader) throw new Error("An error occurred creating the shaders.");
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const error = new Error(
        "An error occurred compiling the shaders: " +
          this.gl.getShaderInfoLog(shader)
      );
      this.gl.deleteShader(shader);
      throw error;
    }
    return shader;
  }

  public compute(
    attributes: WebGLParamValue[],
    uniforms: WebGLParamValue[]
  ): Uint8Array {
    // Set the attributes
    for (const attribute of attributes) {
      this.setAttribute(attribute);
    }

    // Set the uniforms
    for (const uniform of uniforms) {
      this.setUniform(uniform);
    }

    // Draw the scene
    this.gl.clearColor(0.0, 1.0, 0.0, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.drawArrays(this.gl.POINTS, 0, this.size);

    // Read the pixels
    const width = this.width;
    const height = this.height;
    const pixels = new Uint8Array(width * height * 4);
    this.gl.readPixels(
      0,
      0,
      width,
      height,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      pixels
    );
    return pixels.slice(0, this.size * 4);
  }
}

export const WEBGL_TYPE = {
  FLOAT: { name: "float", length: 1 },
  VEC2: { name: "vec2", length: 2 },
  VEC3: { name: "vec3", length: 3 },
  VEC4: { name: "vec4", length: 4 },
};
