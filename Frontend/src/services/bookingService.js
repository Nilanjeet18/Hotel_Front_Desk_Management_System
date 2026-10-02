import axios from "axios";

const BOOKING_BASE_URL = "http://localhost:8080/api/bookings";
const ROOM_BASE_URL = "http://localhost:8080/api/rooms";

// 🔑 Auth header helper
const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found. Please login.");
    return {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    };
};

// 🔍 Check Availability
export const checkAvailability = (roomId, checkIn, checkOut) =>
    axios.post(
        `${BOOKING_BASE_URL}/reception/check`,
        {
            roomId: Number(roomId),
            checkInDate: new Date(checkIn).toISOString().split("T")[0],
            checkOutDate: new Date(checkOut).toISOString().split("T")[0],
        },
        getAuthHeader()
    );

// ✅ Create Booking (guests = optional array of companions:
// [{ name, email, phone, address }, ...])
export const createBooking = (data) =>
    axios.post(
        `${BOOKING_BASE_URL}/reception/booking`,
        {
            customerId: Number(data.customerId),
            roomId: Number(data.roomId),
            checkInDate: new Date(data.checkIn).toISOString().split("T")[0],
            checkOutDate: new Date(data.checkOut).toISOString().split("T")[0],
            guests: data.guests || [],
        },
        getAuthHeader()
    );

// 📋 View All Bookings
export const getAllBookings = () =>
    axios.get(`${BOOKING_BASE_URL}/all`, getAuthHeader());

// 📋 View Single Booking
export const getBookingById = (bookingId) =>
    axios.get(`${BOOKING_BASE_URL}/${bookingId}`, getAuthHeader());

// ✏️ Update Booking
export const updateBooking = (bookingId, data) =>
    axios.put(
        `${BOOKING_BASE_URL}/${bookingId}`,
        {
            checkInDate: new Date(data.checkIn).toISOString().split("T")[0],
            checkOutDate: new Date(data.checkOut).toISOString().split("T")[0],
        },
        getAuthHeader()
    );

// ❌ Cancel Booking
export const cancelBooking = (bookingId) =>
    axios.put(
        `${BOOKING_BASE_URL}/cancel/${bookingId}`,
        {},
        getAuthHeader()
    );

// ✅ GET ROOM BY ID
export const getRoomById = (roomId) =>
    axios.get(
        `${ROOM_BASE_URL}/${roomId}`,
        getAuthHeader()
    );

// ✅ NEW — CHECK OUT a guest (Receptionist only). Backend marks the
// booking CHECKED_OUT and auto-generates its invoice, returned here.
export const checkoutBooking = (bookingId) =>
    axios.put(
        `${BOOKING_BASE_URL}/checkout/${bookingId}`,
        {},
        getAuthHeader()
    );