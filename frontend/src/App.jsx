import { useState } from 'react';
import ChatRoom from './components/ChatRoom';
import Login from './components/Login';
import { Container } from 'react-bootstrap';

function App() {
  // 1. Initialize username state to NULL. This ensures Login loads first.
  const [username, setUsername] = useState(null);

  const handleLogin = (user) => {
    // Once Login.jsx submits a valid name, update state here.
    // This will trigger a re-render and switch to ChatRoom.
    setUsername(user);
  };

  const handleLogout = () => {
    // Once Login.jsx submits a valid name, update state here.
    // This will trigger a re-render and switch to ChatRoom.
    setUsername(null);
  };


  return (
    <Container className="py-4" style={{ height: '100vh' }}>
      {!username ? (
        <Login onLogin={handleLogin} />
      ) : (
        <ChatRoom username={username} onLogout={handleLogout}/>
      )}
    </Container>
  );
}

export default App;