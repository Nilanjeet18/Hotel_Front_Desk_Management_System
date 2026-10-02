package com.example.demo.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import io.jsonwebtoken.Claims;
import java.io.IOException;
import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
                                    throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                Claims claims = jwtUtil.extractAllClaims(token);
                String username = claims.getSubject();
                String role = claims.get("role", String.class);
                
          
                if (username == null || username.equals("nil") || username.isBlank()) {
                    System.out.println("❌ Invalid username in token: " + username);
                    filterChain.doFilter(request, response);
                    return;
                }

                if (username != null && SecurityContextHolder
                        .getContext().getAuthentication() == null) {

                   
                    String formattedRole = (role != null && role.startsWith("ROLE_"))
                                          ? role : "ROLE_" + role;

                    List<GrantedAuthority> authorities = List.of(
                        new SimpleGrantedAuthority(formattedRole)
                    );

                    UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                            username, null, authorities
                        );
                    authToken.setDetails(
                        new WebAuthenticationDetailsSource()
                            .buildDetails(request)
                    );
                    SecurityContextHolder.getContext()
                        .setAuthentication(authToken);
                }
            } catch (Exception e) {
                System.out.println("JWT Error: " + e.getMessage());
            }
        }
        filterChain.doFilter(request, response);
    }
}