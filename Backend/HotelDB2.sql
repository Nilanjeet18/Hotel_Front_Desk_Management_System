show databases;

create database vhoteldb_task2;

use vhoteldb_task2;

CREATE TABLE rooms_table (
    room_id INT AUTO_INCREMENT PRIMARY KEY,
    room_number INT NOT NULL UNIQUE,
    room_type VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL
);

CREATE TABLE customers_table (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(15),
    address TEXT
);

CREATE TABLE booking (									 
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    room_id INT,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    
    FOREIGN KEY (customer_id) REFERENCES customers_table(customer_id)
        ON DELETE CASCADE,
        
    FOREIGN KEY (room_id) REFERENCES rooms_table(room_id)
        ON DELETE CASCADE
);


create table Users
(
	id int AUTO_INCREMENT PRIMARY KEY,
    username varchar(50),
    password varchar(100),
    role varchar(40)
);

SET FOREIGN_KEY_CHECKS = 0;

SET FOREIGN_KEY_CHECKS = 1;



-- nil ADMIN => nil28042004

-- ROLE_RECEPTIONIST => rutu28042004

-- ROLE_MANAGER  => gourav28042004

select *from users;

select *from customers_table;

select * from rooms_table;

select *from booking;

SELECT * FROM booking_guests;

show tables;
