import { useState } from "react";

export default function MessageInput({ onSend }) {
  const [text, setText] = useState("");

  const send = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <div className="message-input">
      <input 
        type="text"
        value={text}
        placeholder="Type message..."
        onChange={e => setText(e.target.value)}
        onKeyDown={e => (e.key === "Enter" ? send() : null)}
      />
      <button onClick={send}>Send</button>
    </div>
  );
}
