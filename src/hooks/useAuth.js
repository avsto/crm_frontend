import { useContext } from "react";
import AuthContext from "../context/AuthContext";

// ======================================================
// USE AUTH
// ======================================================

const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};

// ======================================================
// EXPORTS
// ======================================================

export { useAuth };

export default useAuth;