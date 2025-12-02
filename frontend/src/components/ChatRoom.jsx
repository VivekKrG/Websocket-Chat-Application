import { useState, useEffect } from "react";
import { connect, onMessage, sendMessage } from "../ws/websocket-client";
import MessageList from "./MessageList";
import UserList from "./UserList";
import MessageInput from "./MessageInput";

export default function ChatRoom() {
  const [username, setUsername] = useState("");
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    onMessage((msg) => {
      console.log("RECEIVED:", msg);

      if (msg.type === "JOIN") {
        setUsers(prev => [...prev, msg.sender]);
      }

      if (msg.type === "LEAVE") {
        setUsers(prev => prev.filter(u => u !== msg.sender));
      }

      setMessages(prev => [...prev, msg]);
    });
  }, []);

  const handleJoin = async () => {
    if (!username.trim()) return;

    await connect(username);
    sendMessage({ type: "JOIN", sender: username });

    setConnected(true);
  };

  const handleSend = (content) => {
    sendMessage({
      type: "CHAT",
      sender: username,
      receiver: null,
      content
    });
  };

  return (
    <div className="chat-container">

      {!connected ? (
        <div className="join-box">
          <h2>Join Chat</h2>
          <input 
            type="text"
            placeholder="Enter username..."
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={handleJoin}>Join</button>
        </div>
      ) : (
        <div className="chat-layout">
          <UserList users={users} />
          <div className="chat-box">
            <MessageList messages={messages} currentUser={username} />
            <MessageInput onSend={handleSend} />
          </div>
        </div>
      )}

    </div>
  );
}
