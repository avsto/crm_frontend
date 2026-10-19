import React from "react";
import AppRoutes from "./routes/AppRoutes";
import Notification from "./components/common/Notification";

const App = () => {
  return (
    <>
      <Notification />
      <AppRoutes />
    </>
  );
};

export default App;
