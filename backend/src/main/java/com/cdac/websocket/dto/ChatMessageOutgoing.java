package com.cdac.websocket.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.util.Date;

public class ChatMessageOutgoing {
    private String sender;
    private String content;
    @JsonFormat(pattern = "dd-MM-yyyy hh:mm:ss a", timezone = "IST")
    private Date date = new Date();

    public ChatMessageOutgoing() {
    }

    public ChatMessageOutgoing(String sender, ChatMessageIncoming in) {
        this.sender = sender;
        this.content = in.getContent();
        this.date = in.getDate();
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }
}
