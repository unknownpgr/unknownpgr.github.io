import { Link } from "react-router-dom";
import "./webgl/webgl";

function App() {
  return (
    <div className="container mx-auto py-4">
      <h1 className="text-4xl">Experimental Page</h1>
      <p className="text-lg">This page is for experimental features.</p>
      <ul>
        <li className="py-2 underline">
          <Link to="./webgl">WebGL Computation Acceleration Example</Link>
        </li>
      </ul>
    </div>
  );
}

export default App;
