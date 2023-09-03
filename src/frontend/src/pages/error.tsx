import { Link, useRouteError } from "react-router-dom";
import style from "./error.module.css";

export function ErrorPage() {
  const error = useRouteError();
  console.log(error);
  return (
    <div className={style.error}>
      <h1>Something went wrong.</h1>
      <p>
        Go back to
        <Link to="/"> home.</Link>
      </p>
    </div>
  );
}
