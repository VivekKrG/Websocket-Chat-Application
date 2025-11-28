package com.cdac.websocket.config;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.HttpSessionHandshakeInterceptor;

import java.util.List;
import java.util.Map;

@Component
public class CustomHandshakeInterceptor extends HttpSessionHandshakeInterceptor {

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        boolean httpHandshake = super.beforeHandshake(request, response, wsHandler, attributes);

        // Example: pass a query parameter as session attribute
        if (request instanceof ServletServerHttpRequest) {
            ServletServerHttpRequest servletRequest = (ServletServerHttpRequest)request;

            String user = servletRequest.getServletRequest().getParameter("user");
            attributes.put("username", user != null ? user : "Anonymous");
        }

        List<String> tokenHeader = request.getHeaders().get("Auth-Token");
        if (tokenHeader != null && !tokenHeader.isEmpty()) {
            attributes.put("authToken", tokenHeader.get(0));
        }

        return httpHandshake; // allow handshake
    }
}
