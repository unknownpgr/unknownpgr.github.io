import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import { WebGLComputationUI } from "./webgl/index.tsx";
import { WebGPU } from "./webgpu/index.tsx";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <App />,
    },
    {
      path: "/webgl",
      element: <WebGLComputationUI />,
    },
    {
      path: "/webgpu",
      element: <WebGPU />,
    },
  ],
  {
    basename: "/experimental",
  }
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);
