import { useState } from "react";
import Landing from "./Landing.jsx";
import App from "./App.jsx";

export default function Root() {
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  const [started, setStarted] = useState(false);

  if (!started) {
    return (
      <Landing
        initialLang={path === "/fa" ? "fa" : "en"}
        onStart={() => setStarted(true)}
      />
    );
  }

  return <App />;
}