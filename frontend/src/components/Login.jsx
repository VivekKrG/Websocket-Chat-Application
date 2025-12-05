import { useState } from "react";
import { Card, Form, Button, Row, Col } from "react-bootstrap";

const Login = ({ onLogin }) => {
  const [inputUser, setInputUser] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedUsername = inputUser.trim();
    // Guard clause: Only proceed if username is not empty after trimming
    if (trimmedUsername) {
      onLogin(trimmedUsername);
    }
  };

  return (
    <Row className="justify-content-center align-items-center h-100 bg-light">
      <Col md={6} lg={4}>
        <Card className="shadow-lg border-0 rounded-4">
          <Card.Body className="p-5">
            <div className="text-center mb-4">
              <i
                className="bi bi-chat-dots-fill text-primary"
                style={{ fontSize: "3rem" }}
              ></i>
              <h2 className="fw-bold mt-2">Welcome</h2>
              <p className="text-muted">
                Enter your username to join the chat room.
              </p>
            </div>

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-4" controlId="usernameInput">
                <Form.Label className="fw-semibold">Username</Form.Label>
                <Form.Control
                  size="lg"
                  type="text"
                  placeholder="e.g., JohnDoe"
                  value={inputUser}
                  onChange={(e) => setInputUser(e.target.value)}
                  // Prevent submission if empty
                  isInvalid={inputUser !== "" && inputUser.trim() === ""}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Username cannot be empty spaces.
                </Form.Control.Feedback>
              </Form.Group>
              <Button
                variant="primary"
                size="lg"
                type="submit"
                className="w-100 fw-bold"
                disabled={!inputUser.trim()}
              >
                Enter Chat Room{" "}
                <i className="bi bi-arrow-right-circle-fill ms-2"></i>
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default Login;
