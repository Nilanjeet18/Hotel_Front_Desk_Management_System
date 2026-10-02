package com.example.demo.service;

import java.util.List;
import java.util.Optional;
import com.example.demo.model.Room;

public interface RoomService 
{

    List<Room> getAllRooms();

    Optional<Room> getRoomById(int id);

    Room saveRoom(Room room);

    void deleteRoom(int id);
}