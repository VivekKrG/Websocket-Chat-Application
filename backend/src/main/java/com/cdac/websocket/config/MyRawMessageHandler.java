package com.cdac.websocket.config;


import com.cdac.websocket.dto.ChatMessageIncoming;
import com.cdac.websocket.dto.ChatMessageOutgoing;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * An implementation of TextWebSocketHandler for simple chat Application.
 */
@Component()
public class MyRawMessageHandler extends TextWebSocketHandler {

    // Holds all active sessions
    private final Set<WebSocketSession> sessions = ConcurrentHashMap.newKeySet();
    ObjectMapper mapper = new ObjectMapper();

    ConcurrentMap<String, Queue<ChatMessageOutgoing>> userMessageQueue = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws IOException, InterruptedException {
        sessions.add(session);

        // Update all other connection about this connection
        updateOnlineStatus(session, true);

        // Deliver All pending messages
        deliverQueuedChats(session);
    }

    private void updateOnlineStatus(WebSocketSession session, boolean online) throws IOException {
        for(WebSocketSession s: sessions) {
            if (s.isOpen() & !session.equals(s)) {
                s.sendMessage(new TextMessage(
                        "User: " + session.getAttributes().get("username") + " is " + (online ? "online." : "offline.")
                ));
            }
        }
    }

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String sender = (String) session.getAttributes().get("username");

        ChatMessageIncoming incomingChat = mapper.readValue(message.getPayload(), ChatMessageIncoming.class);

        var outgoingChat = new ChatMessageOutgoing(sender, incomingChat);

        for(String receiver: incomingChat.getReceivers()) {
            boolean messageNotDelivered = true;
            for (WebSocketSession s : sessions) {
                if (s.isOpen() && s.getAttributes().get("username").equals(receiver)) {
                    s.sendMessage(
                            getTextMessage(outgoingChat)
                    );
                    messageNotDelivered = false;
                    break;
                }
            }
            if(messageNotDelivered) {
                userMessageQueue.computeIfAbsent(receiver, (k) -> new ArrayDeque<>()).offer(outgoingChat);
                // Queue<ChatMessageOutgoing> userMessageQueue = userMessageQueue.getOrDefault(receiver, new ArrayDeque<>());
            }
        }
    }

    private WebSocketMessage<?> getTextMessage(ChatMessageOutgoing outgoingChat) {
        return new TextMessage(
                mapper.writeValueAsString(outgoingChat)
        );
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws IOException {
        sessions.remove(session);

        // Update all other connection about this connection
        updateOnlineStatus(session, false);
    }

    private void deliverQueuedChats(WebSocketSession session) throws IOException, InterruptedException {
        String receiver = (String) session.getAttributes().get("username");
        if(userMessageQueue.containsKey(receiver)) {
            Queue<ChatMessageOutgoing> queue = userMessageQueue.get(receiver);
            while(!queue.isEmpty()) {
                session.sendMessage(getTextMessage(queue.poll()));
            }
        }
    }
}
