package com.example.demo.config;

import com.example.demo.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.*;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                // ── Public ──
                .requestMatchers("/api/users/login").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/rooms").permitAll()

                // ── Users / Staff management — ADMIN ONLY ──
                .requestMatchers("/api/users/**").hasRole("ADMIN")

                // ── Customers — ADMIN + RECEPTIONIST manage, ADMIN deletes ──
                .requestMatchers(HttpMethod.DELETE, "/customers/**").hasRole("ADMIN")
                .requestMatchers("/customers/**").hasAnyRole("ADMIN", "RECEPTIONIST")
                .requestMatchers("/customers").hasAnyRole("ADMIN", "RECEPTIONIST")

                // ── Rooms ──
                .requestMatchers(HttpMethod.GET, "/api/rooms/**")
                    .hasAnyRole("ADMIN", "MANAGER", "RECEPTIONIST")
                .requestMatchers(HttpMethod.POST, "/api/rooms/**")
                    .hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/rooms/**")
                    .hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/rooms/**")
                    .hasRole("ADMIN")

                // ── Invoices — see consolidated block further below ──

                // ── Email (dev/admin utility only) ──
                .requestMatchers("/api/email/**").hasRole("ADMIN")

                // ── Bookings ──
                .requestMatchers("/api/bookings/reception/**")
                    .hasAnyRole("ADMIN", "RECEPTIONIST")
                .requestMatchers(HttpMethod.GET, "/api/bookings/reports/customer-history/**")
                    .hasAnyRole("ADMIN", "MANAGER", "RECEPTIONIST")
                // ✅ Receptionist can now see the bookings list (needed to
                //    manage bookings without hunting for a phone number)
                .requestMatchers(HttpMethod.GET, "/api/bookings/all")
                    .hasAnyRole("ADMIN", "MANAGER", "RECEPTIONIST")
                // ✅ Receptionist can view one booking's full detail (guest names)
                .requestMatchers(HttpMethod.GET, "/api/bookings/*")
                    .hasAnyRole("ADMIN", "MANAGER", "RECEPTIONIST")
                .requestMatchers(HttpMethod.GET, "/api/bookings/**")
                    .hasAnyRole("ADMIN", "MANAGER")
                // ✅ Receptionist can now update/cancel bookings (via PUT)
                .requestMatchers(HttpMethod.PUT, "/api/bookings/**")
                    .hasAnyRole("ADMIN", "MANAGER", "RECEPTIONIST")
                .requestMatchers(HttpMethod.DELETE, "/api/bookings/**")
                    .hasAnyRole("ADMIN", "MANAGER")

                // ── Invoices ──
                // Receptionist: generate + send (via checkout flow).
                // Admin: view all + resend only (no first-send).
                // Manager: view all only. All three: download/view a PDF.
                .requestMatchers(HttpMethod.GET, "/api/invoice/all")
                    .hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers(HttpMethod.POST, "/api/invoice/resend/**")
                    .hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/invoice/generate/**", "/api/invoice/send/**")
                    .hasRole("RECEPTIONIST")
                .requestMatchers(HttpMethod.GET, "/api/invoice/pdf/**")
                    .hasAnyRole("ADMIN", "MANAGER", "RECEPTIONIST")

                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .addFilterBefore(jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}