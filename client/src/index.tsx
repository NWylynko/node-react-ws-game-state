import React from "react";
import ReactDOM from "react-dom";
import { AuthProvider } from "./AuthProvider";
import { ServerProvider } from "./ServerConnection";

import { App } from "./App";

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <ServerProvider>
        <App />
      </ServerProvider>
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
