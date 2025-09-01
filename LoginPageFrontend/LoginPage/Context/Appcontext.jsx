import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { io } from "socket.io-client";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(null);
  const [onlineUser, setOnlineUser] = useState([]);
  const [socket, setSocket] = useState(null);

  // Fetch user data
  const getUserData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/data`, {
        withCredentials: true,
      });

      if (data.success) {
        setUserData(data.userData);
        setIsLoggedin(true);
      } else {
        setUserData(null);
        setIsLoggedin(false);
      }
    } catch (error) {
      setUserData(null);
      setIsLoggedin(false);
    }
  };

  // Connect socket - ONLY when userData is available
  const connectSocket = () => {
    if (!userData || !userData._id) return;
    if (socket?.connected) return;

    const newSocket = io(backendUrl, {
      query: { userId: userData._id },
      withCredentials: true,
    });

    newSocket.on("connect", () => {
      setSocket(newSocket);
    });

    newSocket.on("disconnect", () => {
      setSocket(null);
      setOnlineUser([]);
    });

    newSocket.on("connect_error", (error) => {
      // Optional: handle error
    });

    newSocket.on("getOnlineusers", (userIds) => {
      setOnlineUser(userIds);
    });

    newSocket.on("newMessage", (message) => {
      // Optional: handle new message
    });
  };

  // Disconnect socket
  const disconnectSocket = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setOnlineUser([]);
    }
  };

  // Update profile
  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put(`${backendUrl}/api/auth/updated-profile`, body, {
        withCredentials: true,
      });
      if (data.success) {
        toast.success("Profile updated successfully");
        setUserData(data.user);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // On mount - fetch user data
  useEffect(() => {
    getUserData();
  }, []);

  // Connect socket when userData becomes available
  useEffect(() => {
    if (isLoggedin && userData && userData._id) {
      connectSocket();
    } else if (!isLoggedin && socket) {
      disconnectSocket();
    }

    return () => {
      if (socket) {
        disconnectSocket();
      }
    };
  }, [isLoggedin, userData, socket]);

  const value = {
    backendUrl,
    isLoggedin,
    setIsLoggedin,
    userData,
    setUserData,
    getUserData,
    onlineUser,
    socket,
    updateProfile,
    connectSocket,
    disconnectSocket,
  };

  return <AppContext.Provider value={value}>
    {children}
    </AppContext.Provider>;
};
