package com.example.demo.config;

import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.example.demo.dto.BookingDTO;
import com.example.demo.model.Booking;

@Configuration
public class ModelMapperConfig {

    @Bean
    public ModelMapper modelMapper() {
        ModelMapper mapper = new ModelMapper();
        
        //  STRICT matching enable doing because ambiguity problem solving help.
        mapper.getConfiguration()
              .setMatchingStrategy(MatchingStrategies.STRICT);

        // Booking Entity → BookingDTO
        mapper.typeMap(Booking.class, BookingDTO.class).addMappings(m -> {
            m.map(Booking::getCheckIn,  BookingDTO::setCheckInDate);
            m.map(Booking::getCheckOut, BookingDTO::setCheckOutDate);
        });

        // BookingDTO → Booking Entity
        mapper.typeMap(BookingDTO.class, Booking.class).addMappings(m -> {
            m.map(BookingDTO::getCheckInDate,  Booking::setCheckIn);
            m.map(BookingDTO::getCheckOutDate, Booking::setCheckOut);
        });

        return mapper;
    }
}
