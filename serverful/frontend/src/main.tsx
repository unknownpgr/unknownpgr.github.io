import React from 'react'
import ReactDOM from 'react-dom/client'
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements, useRouteError } from "react-router-dom"
import App from './pages/main.tsx'
import './index.css'
import { Post } from "./pages/post.tsx"

function ErrorBoundary() {
  const error = useRouteError();
  console.log(error);
  const message = error instanceof Error ? error.message : "Nah"
  return <div>
    <h1>Something went wrong</h1>
    <p>{message}</p>
  </div>
}

const router = createBrowserRouter(
  createRoutesFromElements(
    [<Route path="/" element={<App />} ErrorBoundary={ErrorBoundary} />,
    <Route path="/posts/:id" element={<Post />} />
    ]
  )
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
