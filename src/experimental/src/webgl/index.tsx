import { useEffect, useMemo, useRef, useState } from "react";
import { WEBGL_TYPE, WebGLComputation } from "./webgl";

export function WebGLComputationUI() {
  const [state, setState] = useState(0);
  const [fps, setFps] = useState(0);
  const valueRef = useRef(0);
  const ref = useRef<HTMLCanvasElement>(null);

  const computation = useMemo(() => {
    return new WebGLComputation(
      1024 * 1024,
      [],
      [
        {
          name: "state",
          type: WEBGL_TYPE.FLOAT,
        },
      ],
      `
      vec2 pos = aPosition.xy;
      // Julia set
      vec2 c = vec2(-0.8, state);
      vec2 z = pos;
      float n = 0.0;
      for (int i = 0; i < 100; i++) {
        z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
        if (length(z) > 4.0) {
          n = float(i) / 100.0;
          break;
        }
      }

      vOutput = vec4(1.0);
      vOutput.r = cos(n*4.0)*0.5+0.5;
      vOutput.g = sin(n*4.0)*0.5+0.5;
      vOutput.b = sin(n*4.0)*0.5+0.5;
      `
    );
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = ref.current.getContext("2d");
    if (!ctx) return;
    let loop = true;
    let value = 0;
    let counter = 0;
    const render = () => {
      if (loop) requestAnimationFrame(render);
      value += (valueRef.current - value) * 0.05;
      counter++;
      const output = computation.compute(
        [],
        [
          {
            name: "state",
            value: new Float32Array([value]),
          },
        ]
      );
      const imageData = ctx.createImageData(1024, 1024);
      for (let i = 0; i < 1024 * 1024; i++) {
        const index = i * 4;
        imageData.data[index] = output[i * 4];
        imageData.data[index + 1] = output[i * 4 + 1];
        imageData.data[index + 2] = output[i * 4 + 2];
        imageData.data[index + 3] = output[i * 4 + 3];
      }
      ctx.putImageData(imageData, 0, 0);
    };
    render();

    const interval = setInterval(() => {
      setFps(counter);
      counter = 0;
    }, 1000);

    return () => {
      loop = false;
      clearInterval(interval);
    };
  }, [computation]);

  valueRef.current = state;

  return (
    <div className="container mx-auto p-4 flex flex-col items-center">
      <h1 className="text-2xl">WebGL Example</h1>
      <p>
        This is an example of WebGL computation acceleration. WebGL is a
        technology for rendering 2D and 3D graphics in a web browser, but
        because of its parallel processing capability, it can be used for
        general purpose computation. I developed a simple library to perform
        general purpose computation using WebGL. This example demonstrates the
        performance of WebGL computation by computing the Julia set.
      </p>
      <br />
      <p>
        The state variable controls the imaginary part of the complex number.
        The canvas resolution is 1024 x 1024 = 1,048,576 pixels and for each
        pixel it performs 100 iterations of the Julia set algorithm. Therefore
        the total number of iterations is at least 104,857,600.
      </p>
      <input
        className="w-64 mt-4"
        type="range"
        min={-1}
        max={1}
        step={0.01}
        value={state}
        onChange={(e) => setState(parseFloat(e.target.value))}
      />
      <div>Current FPS: {fps}</div>
      <div className="mt-4 max-w-full overflow-x-auto">
        <canvas ref={ref} width={1024} height={1024} />
      </div>
    </div>
  );
}
