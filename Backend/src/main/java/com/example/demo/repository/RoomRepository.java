package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.demo.model.Room;

public interface RoomRepository extends JpaRepository<Room, Integer> 
{
	@Query(value = "SELECT * FROM rooms_table WHERE status = 'AVAILABLE'",
		       nativeQuery = true)
		List<Room> getAvailableRooms();
}
