package com.example.demo.service;

import com.example.demo.model.Users;
import com.example.demo.repository.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UsersRepository usersRepository;

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        Users user = usersRepository.findByUsername(username)
                .orElseThrow(() ->
                    new UsernameNotFoundException("User not found: " + username));

        
        String dbRole = user.getRole().toUpperCase().trim();

        String role = dbRole.startsWith("ROLE_")
                ? dbRole             
                : "ROLE_" + dbRole;  

        System.out.println("✅ DB Role: " + dbRole);
        System.out.println("✅ Final GrantedAuthority: " + role);

        return new User(
            user.getUsername(),
            user.getPassword(),
            List.of(new SimpleGrantedAuthority(role))
        );
    }
}