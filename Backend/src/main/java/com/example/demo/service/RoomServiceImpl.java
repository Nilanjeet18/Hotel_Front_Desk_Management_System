package com.example.demo.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.Room;
import com.example.demo.repository.BookingRepository;
import com.example.demo.repository.RoomRepository;

@Service
public class RoomServiceImpl implements RoomService {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Override
    public List<Room> getAllRooms() {
        List<Room> rooms = roomRepository.findAll();
        applyLiveStatus(rooms);
        return rooms;
    }

    @Override
    public Optional<Room> getRoomById(int id) {
        Optional<Room> room = roomRepository.findById(id);
        room.ifPresent(r -> applyLiveStatus(List.of(r)));
        return room;
    }

    @Override
    public Room saveRoom(Room room) {
        return roomRepository.save(room);
    }

    @Override
    public void deleteRoom(int id) {
        roomRepository.deleteById(id);
    }

    // ─────────────────────────────────────────────────────────
    // ✅ Computes each room's TRUE status based on whether it has
    //    an active (non-cancelled) booking covering TODAY.
    //    - "MAINTENANCE" set by Admin is always respected as-is.
    //    - Everything else becomes "Booked" or "Available" live —
    //      never a stale value left over from a past/future booking.
    //    NOTE: this only affects the response sent to the client;
    //    it does NOT write anything back to the database.
    // ─────────────────────────────────────────────────────────
    private void applyLiveStatus(List<Room> rooms) {
        if (rooms.isEmpty()) return;

        List<Integer> occupiedTodayIds = bookingRepository.findOccupiedRoomIdsOn(LocalDate.now());

        for (Room r : rooms) {
            if (r.getStatus() != null && r.getStatus().equalsIgnoreCase("MAINTENANCE")) {
                continue; // admin-set, leave untouched
            }
            r.setStatus(occupiedTodayIds.contains(r.getRoomId()) ? "Booked" : "Available");
        }
    }
}