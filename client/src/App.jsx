import { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Login from "./pages/Login";
import Inbox from "./pages/Inbox";

import "./App.css";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/Inbox" element={<Inbox />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
