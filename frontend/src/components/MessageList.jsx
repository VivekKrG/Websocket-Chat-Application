export default function MessageList({ messages, currentUser }) {
  return (
    <div className="message-list">
      {messages.map((msg, i) => {

        let className = "message";
        if (msg.sender === currentUser) className += " own";

        return (
          <div key={i} className={className}>
            <strong>{msg.sender}: </strong>
            <span>{msg.content}</span>
          </div>
        );
      })}
    </div>
  );
}
