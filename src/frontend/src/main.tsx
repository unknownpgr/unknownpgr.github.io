import React from "react";
import ReactDOM from "react-dom/client";
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import App from "./pages/main.tsx";
import "./index.css";
import { Post } from "./pages/post.tsx";
import { ErrorPage } from "./pages/error.tsx";
import { Tools } from "./pages/tools.tsx";
import { Dashboard } from "./pages/dashboard.tsx";

const router = createBrowserRouter(
  createRoutesFromElements([
    <Route path="/" element={<App />} ErrorBoundary={ErrorPage} />,
    <Route path="/posts/:id" element={<Post />} />,
    <Route path="/tools" element={<Tools />} />,
    <Route path="/dashboard" element={<Dashboard />} />,
  ])
);

const root = document.getElementById("root")!;
function handleResize() {
  if (!root) return;
  root.style.height = `${window.innerHeight}px`;
}
window.addEventListener("resize", handleResize);
handleResize();

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
