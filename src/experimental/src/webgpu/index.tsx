import { useEffect, useRef } from "react";

async function getGPU() {
  if (!navigator.gpu)
    throw new Error("WebGPU is not supported by your browser.");
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) throw new Error("No GPU adapter found.");
  const device = await adapter.requestDevice();
  return device;
}

async function runWebGPU() {
  const device = await getGPU();

  // Create a compute pipeline
  const shaderModule = device.createShaderModule({
    code: `
      @group(0) @binding(0) var<storage, read_write> output: array<u32, 640 * 480>;
      @group(0) @binding(1) var<uniform> cursor: vec2<i32>;

      @compute @workgroup_size(8,8)
      fn main(
        @builtin(global_invocation_id) id: vec3<u32>,
      ) {
        let dx = cursor.x - i32(id.x);
        let dy = cursor.y - i32(id.y);
        let distance = f32(dx * dx + dy * dy);
        let value = 255.0 / (1.0 + distance*0.01);
        let r = u32(value);
        let g = u32(value);
        let b = u32(value);
        let a = 255u;
        let color = u32(r | (g << 8) | (b << 16) | (a << 24));
        output[id.x + id.y * 640] = color;
      }
      `,
  });

  // Create a bind group layout, that describes the resources that can be bound to the pipeline.
  // If a given bind group is not compatible with the layout, the pipeline will not be able to use it.
  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: "storage",
        },
      },
      {
        binding: 1,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: "uniform",
        },
      },
    ],
  });

  // Create a pipeline layout
  const pipelineLayout = device.createPipelineLayout({
    bindGroupLayouts: [bindGroupLayout],
  });

  // Define the compute pipeline
  const pipeline = device.createComputePipeline({
    compute: {
      module: shaderModule,
      entryPoint: "main",
    },
    layout: pipelineLayout,
  });

  const W = 640;
  const H = 480;
  const DATA_LENGTH = W * H * 4;

  // Create buffers
  const outputBuffer = device.createBuffer({
    size: DATA_LENGTH,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
  });
  const stagingBuffer = device.createBuffer({
    size: DATA_LENGTH,
    usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
  });
  const uniformBuffer = device.createBuffer({
    size: 8,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  // Create bind group
  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [
      {
        binding: 0,
        resource: { buffer: outputBuffer },
      },
      {
        binding: 1,
        resource: { buffer: uniformBuffer },
      },
    ],
  });

  // Data setup
  const render = async (x: number, y: number) => {
    const cursor = new Int32Array([x, y]);
    device.queue.writeBuffer(
      uniformBuffer,
      0,
      cursor.buffer,
      cursor.byteOffset,
      cursor.byteLength
    );

    // Create and submit command buffer
    const commandEncoder = device.createCommandEncoder();
    const passEncoder = commandEncoder.beginComputePass();
    passEncoder.setPipeline(pipeline);
    passEncoder.setBindGroup(0, bindGroup);
    passEncoder.dispatchWorkgroups(W / 8, H / 8, 1);
    passEncoder.end();
    commandEncoder.copyBufferToBuffer(
      outputBuffer,
      0,
      stagingBuffer,
      0,
      DATA_LENGTH
    );
    device.queue.submit([commandEncoder.finish()]);
    await device.queue.onSubmittedWorkDone();
    await stagingBuffer.mapAsync(GPUMapMode.READ);
    // Copy the data from the staging buffer to the outputData
    const arrayBuffer = stagingBuffer.getMappedRange();
    const outputData = new Uint8Array(W * H * 4);
    outputData.set(new Uint8Array(arrayBuffer));
    stagingBuffer.unmap();
    return outputData;
  };

  return render;
}

export function WebGPU() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef({ x: 0, y: 0 });
  useEffect(() => {
    let isMounted = true;
    const ctx = canvasRef.current!.getContext("2d")!;
    (async () => {
      const render = await runWebGPU();
      const loop = async () => {
        if (!isMounted) return;
        const { x, y } = cursorRef.current;
        const outputData = await render(x, y);
        const clamped = new Uint8ClampedArray(outputData);
        const imageData = new ImageData(clamped, 640, 480);
        ctx.putImageData(imageData, 0, 0);
        requestAnimationFrame(loop);
      };
      loop();
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width="640"
        height="480"
        onMouseMove={(e) => {
          const rect = canvasRef.current!.getBoundingClientRect();
          const x = Math.floor(e.clientX - rect.left);
          const y = Math.floor(e.clientY - rect.top);
          cursorRef.current = { x, y };
        }}
      />
    </div>
  );
}
