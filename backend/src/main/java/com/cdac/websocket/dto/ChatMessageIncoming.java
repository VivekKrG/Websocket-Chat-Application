package com.cdac.websocket.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.util.Date;
import java.util.List;

public class ChatMessageIncoming {

    private List<String> receivers;
    private String content;
    @JsonFormat(pattern = "dd-MM-yyyy hh:mm:ss a", timezone = "IST")
    private Date date = new Date();

    public ChatMessageIncoming() {}

    public ChatMessageIncoming(List<String> receivers, String content) {
        this.receivers = receivers;
        this.content = content;
    }

    public List<String> getReceivers() {
        return receivers;
    }

    public void setReceivers(List<String> receivers) {
        this.receivers = receivers;
    }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }
}
