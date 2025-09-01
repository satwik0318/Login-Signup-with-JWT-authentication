import { createContext, useContext, useEffect, useState } from "react";
import { AppContext } from "./Appcontext";
import axios from "axios";
import { toast } from "react-toastify";
// No need to import io here.

export const chatContext = createContext();
export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});

    const { backendUrl, userData, socket } = useContext(AppContext);
    const getusers = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/messages/users`, { withCredentials: true });
            if (data.success) {
                setUsers(data.users);
                setUnseenMessages(data.unseenMessages);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };
    
    // function to get messages for selected user
    const getMessages = async (selectedUser) => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/messages/${selectedUser}`, { withCredentials: true });
            if (data.success) {
                setMessages(data.messages || []);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };
    
    // to send message to selected user
    const sendMessage = async (messageData) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/messages/send/${selectedUser._id}`, messageData, { withCredentials: true });
            if (data.success) {
                setMessages((prevMessages) => [...(prevMessages || []), data.newMessage]);
            } else {
                toast.error(data.messages);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };
    
    // function to chat to selected user
    const subscribeToMessages = () => {
        if (!socket) return;
        socket.on("newMessage", (newMessage) => {
            console.log("recived new message", newMessage);
            if (selectedUser && newMessage.senderId === selectedUser._id) {
                newMessage.seen = true;
                setMessages((prevMessages) => [...prevMessages, newMessage]);
                axios.put(`${backendUrl}/api/messages/marks/${newMessage._id}`, null, { withCredentials: true });
            } else {
                setUnseenMessages(prevUnseenMessage => ({
                    ...prevUnseenMessage,
                    [newMessage.senderId]: prevUnseenMessage[newMessage.senderId] ? prevUnseenMessage[newMessage.senderId] + 1 : 1
                }));
            }
        });
    };
    
    // function to unsubscribe from messages
    const unsubscribeToMessages = () => {
        if (socket) socket.off("newMessage");
    };
    
    useEffect(() => {
        subscribeToMessages();
        return () => unsubscribeToMessages();
    }, [socket, selectedUser]);
    
    const value = {
        messages, users, selectedUser, getusers,
        setMessages, sendMessage, setSelectedUser,
        unseenMessages, setUnseenMessages, getMessages
    };
    
    return (
        <chatContext.Provider value={value}>
            {children}
        </chatContext.Provider>
    );
};