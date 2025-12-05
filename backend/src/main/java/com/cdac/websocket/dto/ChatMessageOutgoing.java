package com.cdac.websocket.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.util.Date;

public class ChatMessageOutgoing<C> {
    private MessageType type = MessageType.CHAT;
    private String sender;
    private C content;
    @JsonFormat(pattern = "dd-MM-yyyy hh:mm:ss a", timezone = "IST")
    private Date date = new Date();

    public ChatMessageOutgoing() {
    }

    public ChatMessageOutgoing(String sender, ChatMessageIncoming in) {
        this.sender = sender;
        this.content = (C) in.getContent();
        this.date = in.getDate();
    }

    public ChatMessageOutgoing(MessageType type, String sender, C content) {
        this.type = type;
        this.sender = sender;
        this.content = content;
    }

    public MessageType getType() {
        return type;
    }

    public void setType(MessageType type) {
        this.type = type;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public C getContent() {
        return content;
    }

    public void setContent(C content) {
        this.content = content;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }
}
