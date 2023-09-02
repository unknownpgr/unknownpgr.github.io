import { useState } from "react";
import styles from "./tools.module.css";

function DCJGenerator() {
  const [registry, setRegistry] = useState("se.ction.link");
  const [username, setUsername] = useState("unknownpgr");
  const [password, setPassword] = useState("");

  const authString = `${username}:${password}`;
  const dcjObject = {
    auths: {
      [registry]: {
        auth: btoa(authString),
      },
    },
  };
  const dcjString = JSON.stringify(dcjObject);

  const secret = {
    apiVersion: "v1",
    kind: "Secret",
    metadata: {
      name: "regcred",
    },
    type: "kubernetes.io/dockerconfigjson",
    data: {
      ".dockerconfigjson": btoa(dcjString),
    },
  };
  const secretString = JSON.stringify(secret);

  return (
    <div>
      <h2>Dockerconfigjson generator</h2>
      <p>
        <div className={styles.form}>
          <label>Registry</label>
          <input
            type="text"
            value={registry}
            onChange={(e) => setRegistry(e.target.value)}
          />
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label>Dockerconfigjson</label>
          <textarea value={dcjString} readOnly />
          <label>Secret</label>
          <textarea value={secretString} readOnly />
        </div>
      </p>
    </div>
  );
}

export function Tools() {
  return (
    <div className={styles.container}>
      <h1>Tools</h1>
      <p>Easy-tools for dev</p>
      <DCJGenerator />
    </div>
  );
}
