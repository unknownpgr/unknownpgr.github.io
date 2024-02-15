import ReactDOM from "react-dom/client";
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import "./index.css";
import { Dashboard } from "./pages/dashboard.tsx";
import { ErrorPage } from "./pages/error.tsx";
import App from "./pages/main.tsx";
import { Post } from "./pages/post.tsx";
import { Tools } from "./pages/tools.tsx";

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

ReactDOM.createRoot(root).render(<RouterProvider router={router} />);
