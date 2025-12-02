let socket = null;
let connectCallback = null;
let messageCallback = null;
let closeCallback = null;

export function connect(username) {
  return new Promise((resolve, reject) => {
    socket = new WebSocket(`ws://localhost:8070/chat?user=${username}`);

    socket.onopen = () => {
      console.log("Connected to WebSocket");
      if (connectCallback) connectCallback();
      resolve();
    };

    socket.onerror = (err) => {
      console.error("WebSocket error", err);
      reject(err);
    };

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (messageCallback) messageCallback(msg);
    };

    socket.onclose = () => {
      console.warn("WebSocket closed");
      if (closeCallback) closeCallback();
    };
  });
}

export function sendMessage(msgObj) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(msgObj));
  }
}

export function onConnect(cb) { connectCallback = cb; }
export function onMessage(cb) { messageCallback = cb; }
export function onClose(cb) { closeCallback = cb; }
