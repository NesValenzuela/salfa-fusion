import React from "react";
import { BrowserRouter } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import AppRouter from "./routes/AppRouter";
import "./login.css";
import "./navbar.css";

const App = () => {
  return (
    <BrowserRouter>
      <UserProvider>
        <AppRouter />
      </UserProvider>
    </BrowserRouter>
  );
};

export default App;
