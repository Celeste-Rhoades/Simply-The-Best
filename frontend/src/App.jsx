// import { useState } from "react";
import { BrowserRouter, Route, Routes, Link } from "react-router-dom";
import FormDropDown from "../src/Components/FormDropDown";
import NavBar from "../src/Components/NavBar";

function App() {
  return (
    <>
      <BrowserRouter>
        {/* <Routes> */}
        {/* <Route> */}
        <div>
          <NavBar />
        </div>
        <FormDropDown />
        {/* </Route> */}
        {/* </Routes> */}
      </BrowserRouter>
    </>
  );
}

export default App;
