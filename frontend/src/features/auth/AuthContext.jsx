import { createContext, useState, useEffect } from "react";
import * as authApi from "../../api/authApi";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, if a token exists, verify it and restore the session.
  // The `active` flag prevents a late/duplicate response (e.g. from
  // React.StrictMode's double-invoke in dev) from overwriting good state.
  useEffect(() => {
    let active = true;
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    authApi
      .getMe()
      .then((data) => {
        if (active) setUser(data);
      })
      .catch(() => {
        if (active) {
          localStorage.removeItem("token");
          setUser(null);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = async (email, password) => {
    const data = await authApi.login(email, password);
    localStorage.setItem("token", data.token);
    setUser(data.user);
    return data.user;
  };

  const loginWithGoogle = async (idToken) => {
    const data = await authApi.googleAuth(idToken);
    localStorage.setItem("token", data.token);
    setUser(data.user);
    return data.user;
  };

  const signup = async (userData) => {
    // accept object or individual parameters for backward compatibility
    let payload;
    if (typeof userData === "object") {
      payload = userData;
    } else {
      payload = { name: arguments[0], email: arguments[1], password: arguments[2] };
    }
    const data = await authApi.signup(payload);
    localStorage.setItem("token", data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, signup, logout, setUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};