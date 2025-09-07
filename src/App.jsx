import { useState } from "react";
import "./App.css";
import MainView from "./views/MainView";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <MainView />
    </>
  );
}

export default App;
