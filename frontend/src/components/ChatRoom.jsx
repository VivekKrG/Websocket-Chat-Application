import { useState, useEffect, useRef } from "react";
import {
  Row,
  Col,
  Card,
  Form,
  Button,
  ListGroup,
  Badge,
  Alert,
} from "react-bootstrap";



const ChatRoom = ({ username, onLogout }) => {
  // --- SAFEGUARD: If ChatRoom loads without a username, stop here. ---
  if (!username || typeof username !== "string") {
    return (
      <Alert variant="danger">
        Error: Missing username. Please reload and log in again.
      </Alert>
    );
  }

  // You should include logic here to ensure the WebSocket connection is closed
  // before calling onLogout, which unmounts the component.
  const handleManualLogout = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      // NOTE: You might need to send a specific 'OFFLINE' message here
      // to your Spring Boot backend if it doesn't automatically detect the closure.

      // Cleanly close the socket. The cleanup useEffect will also run, but this is explicit.
      ws.close(1000, "User logout requested");
    }
    // Trigger the state change to go back to the login page
    onLogout();
  };

  const [ws, setWs] = useState(null);
  const [usersMap, setUsersMap] = useState(new Map());
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [selectedReceivers, setSelectedReceivers] = useState(new Set());
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // =========================================
  // 1. FIXED WebSocket Connection Logic
  // =========================================
  useEffect(() => {
    // Double check username exists before trying to connect
    if (!username) return;

    console.log(`Attempting connection for: ${username}`);
    const socketUrl = `ws://localhost:8070/chat?user=${username}`;
    const socket = new WebSocket(socketUrl);

    socket.onopen = () => {
      console.log(`WebSocket connected successfully.`);
      // Add self to user list initially as ONLINE
      setUsersMap((prev) => new Map(prev).set(username, "ONLINE"));
      // Only set the active socket in state once it's truly open
      setWs(socket);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleIncomingMessage(data);
      } catch (e) {
        console.error("Error parsing message JSON:", event.data);
      }
    };

    socket.onclose = (event) => {
      console.log("WebSocket connection closed.", event.reason);
      setWs(null); // Clean up state
    };

    socket.onerror = (error) => {
      // We changed alert() to console.error().
      // Blocking alerts in onError are bad UX during connection hiccups.
      console.error("WebSocket encountered an error:", error);
      // You could potentially set an error state here to show a UI message instead of an alert
    };

    // Cleanup on unmount
    return () => {
      console.log("Cleaning up WebSocket connection...");
      // Check if "CONNECTING" (0) or "OPEN" (1)
      if (
        socket.readyState === WebSocket.CONNECTING ||
        socket.readyState === WebSocket.OPEN
      ) {
        // --- THE CRITICAL FIX ---
        // Before closing, nullify the error handler.
        // This prevents the "closed before established" error from triggering the onerror logic above.
        socket.onerror = null;
        socket.onclose = null; // Also good practice to nullify onclose during cleanup
        socket.close();
      }
    };
  }, [username]);
  // =========================================
  // END FIX
  // =========================================

  // 2. Handle Incoming Data
  const handleIncomingMessage = (data) => {
    // Contract: data = { "content": "...", "date": "...", "sender": "...", "type": "ONLINE"|"OFFLINE" }
    const messageType = data.type;

    if (messageType === "ONLINE" || messageType === "OFFLINE") {
      // Update User Status Map
      setUsersMap((prevMap) => {
        const newMap = new Map(prevMap);
        // Important: Ensure we don't overwrite our own status if the backend echoes it back
        if (data.sender !== username) {
          newMap.set(data.sender, messageType);
        }
        return newMap;
      });
      // Add system message to history
      setMessages((prev) => [...prev, { ...data, isSystem: true }]);
    } else if (messageType === "USER_LIST") {
      setUsersMap((prevMap) => {
        const newMap = new Map();
        // Important: Ensure we don't overwrite our own status if the backend echoes it back
        for (const [username, active] of Object.entries(data.content)) {
          newMap.set(username, active ? "ONLINE" : "OFFLINE");
        }

        return newMap;
      });
    } else {
      // Assuming generic chat messages might not have 'type', or have type 'CHAT'
      setMessages((prev) => [...prev, { ...data, isSystem: false }]);
    }
  };

  // 3. Handle Sending Messages
  const sendMessage = (e) => {
    e.preventDefault();
    const cleanedInput = messageInput.trim();

    if (
      cleanedInput &&
      selectedReceivers.size > 0 &&
      ws &&
      ws.readyState === WebSocket.OPEN
    ) {
      const receiverArray = Array.from(selectedReceivers);

      const messagePayload = {
        receivers: receiverArray,
        content: cleanedInput,
      };

      ws.send(JSON.stringify(messagePayload));

      // Optimistically add my own message to the chat window
      const myMessage = {
        sender: username,
        content: cleanedInput,
        date: new Date().toLocaleString(),
        type: "CHAT",
        isSystem: false,
      };
      setMessages((prev) => [...prev, myMessage]);

      setMessageInput("");
    }
  };

  // Toggle user selection
  const handleUserToggle = (userToToggle) => {
    setSelectedReceivers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userToToggle)) {
        newSet.delete(userToToggle);
      } else {
        newSet.add(userToToggle);
      }
      return newSet;
    });
  };

  // Select all users helper
  const handleSelectAll = () => {
    if (selectedReceivers.size === usersMap.size) {
      setSelectedReceivers(new Set()); // Deselect all
    } else {
      setSelectedReceivers(new Set(usersMap.keys())); // Select all keys
    }
  };

  return (
    <Row className="h-100 g-0 rounded-4 overflow-hidden shadow-lg">
      {/* --- Left Sidebar: Users List --- */}
      <Col
        md={4}
        lg={3}
        className="h-100 d-flex flex-column bg-light border-end"
      >
        <Card
          className="flex-grow-1 border-0 bg-transparent"
          style={{ maxHeight: "100vh", overflowY: "auto" }}
        >
          <Card.Header className="bg-transparent border-bottom py-3 d-flex justify-content-between align-items-center">
            <h6 className="m-0 fw-bold">
              <i className="bi bi-people-fill text-primary me-2"></i>
              Available Users
            </h6>
            <Badge bg="primary" pill>
              {usersMap.size}
            </Badge>
          </Card.Header>
          {usersMap.size > 1 && (
            <div
              className="px-3 py-2 border-bottom bg-white small clickable"
              onClick={handleSelectAll}
              style={{ cursor: "pointer" }}
            >
              {selectedReceivers.size === usersMap.size
                ? "Deselect All"
                : "Select All"}
            </div>
          )}
          <ListGroup variant="flush" className="flex-grow-1">
            {Array.from(usersMap.entries()).map(([user, status]) => {
              // Filter out "undefined" or null users just in case backend sends garbage
              if (!user || user === "undefined" || user === "null") return null;

              const isOnline = status === "ONLINE";
              const isSelected = selectedReceivers.has(user);
              const isSelf = user === username;

              return (
                <ListGroup.Item
                  key={user}
                  action={!isSelf} // Disable action hover for self if you don't want to message yourself
                  onClick={() => handleUserToggle(user)}
                  className={`d-flex justify-content-between align-items-center py-3 border-0 ${
                    isSelected ? "bg-white" : "bg-transparent"
                  }`}
                  style={{
                    cursor: "pointer",
                    borderLeft: isSelected
                      ? "4px solid var(--bs-primary)"
                      : "4px solid transparent",
                  }}
                >
                  <div className="d-flex align-items-center overflow-hidden">
                    <Form.Check
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="me-3 pointer-event-none"
                    />
                    <div className="text-truncate">
                      <span className="fw-semibold">{user}</span>
                      {isSelf && (
                        <span className="text-muted small ms-1">(You)</span>
                      )}
                    </div>
                  </div>
                  <i
                    className={`bi bi-circle-fill small ms-2 ${
                      isOnline ? "text-success" : "text-secondary"
                    }`}
                    title={status}
                  ></i>
                </ListGroup.Item>
              );
            })}
          </ListGroup>
        </Card>
      </Col>

      {/* --- Right Side: Chat Area --- */}
      <Col md={8} lg={9} className="h-100 d-flex flex-column bg-white">
        <Card
          onReset={() => setInputUser(null)}
          className="flex-grow-1 border-0 h-100"
        >
          <Card.Header className="bg-white border-bottom py-3 d-flex align-items-center justify-content-between">
            {/* </Card.Header><Card.Header className="bg-white border-bottom py-3 d-flex align-items-center"> */}
            <h5 className="m-0 text-truncate">
              Welcome, <span className="text-primary">{username}</span>
            </h5>

            <span className="ms-auto text-muted small mx-2">
              Targeting: <strong>{selectedReceivers.size}</strong> users
            </span>

            <Button
              variant="outline-danger"
              size="sm"
              onClick={handleManualLogout}
            >
              <i className="bi bi-box-arrow-right me-1"></i> Logout
            </Button>
          </Card.Header>

          {/* Chat Messages History Area */}
          <Card.Body
            className="d-flex flex-column p-0"
            style={{ backgroundColor: "#f0f2f5" }}
          >
            <div
              className="flex-grow-1 overflow-auto p-4"
              style={{ maxHeight: "80vh" }}
            >
              {messages.length === 0 ? (
                <div className="text-center text-muted mt-5">
                  <i className="bi bi-chat-square-text display-4 text-secondary opacity-50"></i>
                  <p className="mt-3">
                    Select users from the sidebar and start chatting!
                  </p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <MessageBubble
                    key={index}
                    message={msg}
                    currentUsername={username}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Area */}
            <div className="p-3 bg-white border-top">
              <Form onSubmit={sendMessage}>
                <Row className="g-2 align-items-center">
                  <Col>
                    <Form.Control
                      size="lg"
                      type="text"
                      placeholder={
                        selectedReceivers.size === 0
                          ? "Select receivers first..."
                          : `Message ${selectedReceivers.size} users...`
                      }
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      disabled={selectedReceivers.size === 0}
                      className="rounded-pill bg-light border-0 px-4"
                    />
                  </Col>
                  <Col xs="auto">
                    <Button
                      variant="primary"
                      size="lg"
                      type="submit"
                      disabled={
                        !messageInput.trim() ||
                        selectedReceivers.size === 0 ||
                        !ws ||
                        ws.readyState !== WebSocket.OPEN
                      }
                      className="rounded-circle p-3 d-flex align-items-center justify-content-center"
                      style={{ width: "50px", height: "50px" }}
                    >
                      <i className="bi bi-send-fill"></i>
                    </Button>
                  </Col>
                </Row>
                {selectedReceivers.size === 0 && messageInput.trim() && (
                  <Form.Text className="text-danger small ps-3">
                    <i className="bi bi-exclamation-circle me-1"></i>Select at
                    least one receiver.
                  </Form.Text>
                )}
              </Form>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

// Sub-component for rendering a single message bubble (No major changes here, just styling)
const MessageBubble = ({ message, currentUsername }) => {
  const isOwnMessage = message.sender === currentUsername;
  const isSystem = message.isSystem;

  if (isSystem) {
    const isOnlineMsg = message.type === "ONLINE";
    return (
      <div className="text-center my-3">
        <small
          className={`badge ${
            isOnlineMsg
              ? "bg-success-subtle text-success-emphasis"
              : "bg-secondary-subtle text-secondary-emphasis"
          } border-0 px-3 py-2 rounded-pill fw-normal`}
        >
          <i
            className={`bi ${
              isOnlineMsg ? "bi-box-arrow-in-right" : "bi-box-arrow-right"
            } me-2`}
          ></i>
          <strong>{message.sender}</strong> {isOnlineMsg ? "joined" : "left"}
          <span className="ms-2 opacity-75" style={{ fontSize: "0.8em" }}>
            {message.date.split(" ")[1]}
          </span>
        </small>
      </div>
    );
  }

  return (
    <div
      className={`d-flex flex-column mb-3 ${
        isOwnMessage ? "align-items-end" : "align-items-start"
      }`}
    >
      {!isOwnMessage && (
        <div className="small text-muted ms-2 mb-1">{message.sender}</div>
      )}
      <div
        className={`p-3 rounded-4 shadow-sm ${
          isOwnMessage
            ? "bg-primary text-white rounded-bottom-end-0"
            : "bg-white text-dark border rounded-bottom-start-0"
        }`}
        style={{ maxWidth: "70%", minWidth: "120px", position: "relative" }}
      >
        <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {message.content}
        </div>
      </div>
      <div
        className="small text-muted mt-1 mx-2"
        style={{ fontSize: "0.75em" }}
      >
        {message.date}
      </div>
    </div>
  );
};

export default ChatRoom;
