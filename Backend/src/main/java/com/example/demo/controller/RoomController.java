package com.example.demo.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.dto.BookingDTO;
import com.example.demo.model.Room;
import com.example.demo.repository.BookingRepository;
import com.example.demo.repository.RoomRepository;
import com.example.demo.service.BookingService;
import com.example.demo.service.RoomService;

import jakarta.validation.Valid;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    @Autowired
    private RoomService roomService;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private RoomRepository roomRepository;
    
    @Autowired
    private BookingRepository bookingRepository;

    // for public API
    @GetMapping
    public List<Room> getAllRooms() {
        return roomService.getAllRooms();
    }

    //  GET room by ID
    @GetMapping("/{id}")
    public ResponseEntity<Room> getRoomById(@PathVariable int id) {
        return roomService.getRoomById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new RuntimeException("Room not found with id: " + id));
    }

    // ADD new room (ADMIN only)
    @PostMapping
    public Room addRoom(@RequestBody Room room) {
        return roomService.saveRoom(room);
    }

    // Booking API
    @PostMapping("/book")
    public ResponseEntity<?> createBooking(@Valid @RequestBody BookingDTO bookingDTO) {
        return ResponseEntity.ok(bookingService.createBooking1(bookingDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRoom(@PathVariable int id) {
        return roomRepository.findById(id).map(room -> {
   
        	bookingRepository.deleteByRoom_RoomId(id); 
            roomService.deleteRoom(id);
            return ResponseEntity.ok("Room deleted successfully");
        }).orElse(ResponseEntity.notFound().build());
    }

    // UPDATE room
    @PutMapping("/{id}")
    public ResponseEntity<?> updateRoom(@PathVariable int id, @RequestBody Room roomDetails) {

        return roomRepository.findById(id).map(room -> {
            room.setRoomNumber(roomDetails.getRoomNumber());
            room.setRoomType(roomDetails.getRoomType());
            room.setPrice(roomDetails.getPrice());
            roomRepository.save(room);
            return ResponseEntity.ok(room);
        }).orElse(ResponseEntity.notFound().build());
    }
}