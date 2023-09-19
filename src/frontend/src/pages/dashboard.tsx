import { useState } from "react";
import styles from "./dashboard.module.css";

function Login({ onLoggedIn }: { onLoggedIn: (authString: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    const authString = "Basic " + btoa(username + ":" + password);

    const response = await fetch("/api/login", {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Authorization: authString,
      },
    });
    // Check response status code
    if (response.status === 200) {
      onLoggedIn(authString);
    } else {
      setPassword("");
    }
  }

  return (
    <div>
      <div>
        <label>Username </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <label>Password </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export function Dashboard() {
  const [authString, setAuthString] = useState("");

  function api<T = object>(url: string, method: string = "get", body?: T) {
    return fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: authString,
      },
      body: body && JSON.stringify(body),
    });
  }

  function handleClearPostCache() {
    api("/api/cache-clear").then((response) => {
      if (response.status === 200) {
        alert("Post cache cleared");
      } else {
        alert("Failed to clear post cache");
      }
    });
  }

  return (
    <div className={styles.container}>
      <h1>Dashboard</h1>
      <div hidden={authString !== ""}>
        <Login onLoggedIn={setAuthString} />
      </div>
      <div hidden={authString === ""}>
        <div>
          <button onClick={handleClearPostCache}>Clear post cache</button>
        </div>
      </div>
    </div>
  );
}
