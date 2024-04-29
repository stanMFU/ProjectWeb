const express = require('express');
const path = require('path');
const bcrypt = require("bcrypt");
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const con = require('./config/db');
const app = express();
const cron = require('node-cron');
const db = require('./config/db'); // Assuming db.js is in the same directory
const cors = require('cors');
app.use(cors()); // This will allow all CORS requests





  async function verifyCredentials(username, password) {
    try {
        // Using the promise-based query method
        const [users] = await con.query('SELECT user_id, username, password, role FROM users WHERE username = ?', [username]);
        if (users.length > 0) {
            const user = users[0];
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (passwordMatch) {
                return { user_id: user.user_id, username: user.username, role: user.role };
            }
        }
        return null;
    } catch (err) {
        console.error('Error verifying credentials:', err);
        throw err;
    }
}

// Middleware
app.use("/public", express.static(path.join(__dirname, "public")));
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Session management
app.use(session({
    secret: 'mysecretcode',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 86400000 },
    store: new MemoryStore({ checkPeriod: 86400000 })
}));

// Updating rooms to free status at midnight everyday
cron.schedule('0 0 * * *', async () => {
    // Runs at midnight every day
    try {
        await con.promise().query(
            "UPDATE rooms SET status_8_10 = 'Free', status_10_12 = 'Free', status_13_15 = 'Free', status_15_17 = 'Free'"
        );
        console.log('Room statuses reset for the next day.');
    } catch (err) {
        console.error('Failed to reset room statuses:', err);
    }
});

// Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '/view/login.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, '/view/login.html')));
app.get('/HomepageUser.html', (req, res) => res.sendFile(path.join(__dirname, '/view/HomepageUser.html')));
app.get('/HomepageApprover.html', (req, res) => res.sendFile(path.join(__dirname, '/view/HomepageApprover.html')));
app.get('/HomepageStaff.html', (req, res) => res.sendFile(path.join(__dirname, '/view/HomepageStaff.html')));
app.get('/Register.html', (req, res) => res.sendFile(path.join(__dirname, '/view/Register.html')));
app.get('/request.html', (req, res) => res.sendFile(path.join(__dirname, '/view/request.html')));
app.get('/approverHistory.html', (req, res) => res.sendFile(path.join(__dirname, '/view/approverHistory.html')));
app.get('/dashboard.html', (req, res) => res.sendFile(path.join(__dirname, '/view/dashboard.html')));
app.get('/userHistory.html', (req, res) => res.sendFile(path.join(__dirname, '/view/userHistory.html')));
app.get('/staffHistory.html', (req, res) => res.sendFile(path.join(__dirname, '/view/staffHistory.html')));

// API routes
app.get('/api/session', (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.json({ loggedIn: false });
    }
});

app.get('/api/bookings', async (req, res) => {
    try {
        const sql = `SELECT b.*, r.room_name, u.firstname, u.lastname 
                     FROM bookings b
                     JOIN users u ON b.user_id = u.user_id
                     JOIN rooms r ON b.room_id = r.room_id;`; // Ensure this JOIN is correct
        const [results] = await db.query(sql);
        res.json(results);
    } catch (error) {
        console.error('Failed to fetch bookings:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get('/api/completed-bookings', async (req, res) => {
    try {
        const sql = `
            SELECT 
                r.room_name, 
                bh.date, 
                bh.time_slot, 
                u.firstname, 
                u.lastname, 
                bh.reason, 
                bh.status,
                bh.approver_id  /* Include approver_id in the selection */
            FROM 
                bookinghistory bh
            JOIN 
                rooms r ON bh.room_id = r.room_id
            JOIN 
                users u ON bh.user_id = u.user_id
            ORDER BY 
                bh.date DESC;
        `;
        const results = await db.query(sql);
        console.log(results);  // Debugging output
        res.json(results[0]);  // Make sure you are sending the correct part of the results
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});





app.get('/api/room-details', (req, res) => {
    const roomId = req.query.roomId;
    if (!roomId) {
        return res.status(400).json({ error: "Room ID is required" });
    }

    const sql = 'SELECT * FROM rooms WHERE room_id = ?';
    con.query(sql, [roomId], (err, results) => {
        if (err) {
            console.error('Error fetching room details:', err);
            return res.status(500).json({ error: "Database server error: " + err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: "Room not found" });
        }
        res.json(results[0]); // Send back the first result of the query
    });
});



app.get('/api/approver-history', async (req, res) => {
    const approverId = req.query.approverId; // Assuming you're passing the approver's ID as a query parameter

    if (!approverId) {
        return res.status(400).json({ error: 'Approver ID is required' });
    }

    try {
        const sql = `
            SELECT h.*, r.room_name, u.firstname, u.lastname
            FROM bookinghistory h
            JOIN rooms r ON h.room_id = r.room_id
            JOIN users u ON h.user_id = u.user_id
            WHERE h.approver_id = ?
            ORDER BY h.date DESC;
        `;
        const [results] = await db.query(sql, [approverId]);
        res.json(results.map(row => ({
            room_name: row.room_name,
            date: row.date,
            time_slot: row.time_slot,
            firstname: row.firstname,
            lastname: row.lastname,
            status: row.status // Assuming status 1 is approved, 0 is rejected
        })));
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});


app.get('/api/booking-history', async (req, res) => {
    const userId = req.query.userId;
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        const sql = `
            SELECT bh.history_id, bh.date, bh.time_slot, bh.status, r.room_name, u.username AS booked_by, bh.reason
            FROM bookinghistory bh
            JOIN rooms r ON bh.room_id = r.room_id
            JOIN users u ON bh.user_id = u.user_id
            WHERE bh.user_id = ?
            ORDER BY bh.date DESC, bh.time_slot;
        `;
        const [results] = await db.query(sql, [userId]);
        if (results.length === 0) {
            return res.status(404).json({ error: 'No booking history found for this user' });
        }
        console.log("Booking History Data:", results); // Log to debug the data
        res.json(results);
    } catch (error) {
        console.error('Database error while fetching booking history:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});




app.get('/api/room-statuses', getRoomStatuses);
app.get('/api/pending-requests', getPendingRequests);
app.get('/api/resolved-requests', getResolvedRequests);

// Check for pending bookings for a specific user
app.get('/api/check-pending-booking', async (req, res) => {
    const userId = req.query.userId;
    const today = new Date().toISOString().slice(0, 10);

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        // Query current bookings
        const bookingsSql = `
            SELECT b.booking_id, b.room_id, b.date, b.time_slot, b.status, r.room_name
            FROM bookings b
            JOIN rooms r ON b.room_id = r.room_id
            WHERE b.user_id = ? AND b.date = ? AND (b.status = 'Pending' OR b.status = 'Approved' OR b.status = 'Rejected')
            ORDER BY b.date DESC, b.time_slot;
        `;
        // Query historical bookings (especially to check for rejections)
        const historySql = `
            SELECT h.history_id AS booking_id, h.room_id, h.date, h.time_slot, CASE WHEN h.status = 1 THEN 'Approved' ELSE 'Rejected' END AS status, r.room_name
            FROM bookinghistory h
            JOIN rooms r ON h.room_id = r.room_id
            WHERE h.user_id = ? AND h.date = ?
            ORDER BY h.date DESC, h.time_slot;
        `;
        const [bookingsResults] = await db.query(bookingsSql, [userId, today]);
        const [historyResults] = await db.query(historySql, [userId, today]);

        const allResults = [...bookingsResults, ...historyResults];

        if (allResults.length > 0) {
            const bookings = allResults.map(booking => ({
                bookingId: booking.booking_id,
                roomName: booking.room_name,
                date: booking.date,
                timeSlot: booking.time_slot,
                status: booking.status
            }));
            res.json({ hasBooking: true, bookings: bookings });
        } else {
            res.json({ hasBooking: false, bookings: [] });
        }
    } catch (error) {
        console.error('Database error while checking bookings:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});






app.delete('/api/bookings/:bookingId', async (req, res) => {
    const { bookingId } = req.params;
    let connection; // Declare connection outside try block to ensure it's accessible in finally block

    try {
        connection = await db.getConnection(); // Get the connection from your pool
        await connection.beginTransaction(); // Start transaction

        // First, fetch the booking details to get the room ID and time slot
        const [bookingDetails] = await connection.query('SELECT room_id, time_slot FROM bookings WHERE booking_id = ?', [bookingId]);
        if (bookingDetails.length === 0) {
            throw new Error('Booking not found.');
        }

        const booking = bookingDetails[0];

        // Delete the booking
        const deleteResult = await connection.query('DELETE FROM bookings WHERE booking_id = ?', [bookingId]);
        if (deleteResult.affectedRows === 0) {
            throw new Error('No booking found to delete.');
        }

        // Update the corresponding time slot status in the rooms table
        const statusField = `status_${booking.time_slot.replace('-', '_')}`; // e.g., status_8_10
        const updateRoomStatus = await connection.query(`UPDATE rooms SET ${statusField} = 'Free' WHERE room_id = ?`, [booking.room_id]);
        if (updateRoomStatus.affectedRows === 0) {
            throw new Error('Failed to update room status.');
        }

        await connection.commit(); // Commit the transaction if all operations are successful
        res.json({ message: 'Booking successfully cancelled and room status updated.' });
    } catch (error) {
        if (connection) {
            await connection.rollback(); // Rollback the transaction on error
        }
        console.error('Error during booking cancellation:', error);
        res.status(500).json({ error: 'Database error during the cancellation process', details: error.message });
    } finally {
        if (connection) {
            connection.release(); // Always release the connection
        }
    }
});







app.get('/api/rooms', async (req, res) => {
    console.log("Attempting to fetch rooms...");
    try {
        // Include the 'img' field in your SELECT statement
        const [rows, fields] = await db.query("SELECT room_id, room_name, details, img, status_8_10, status_10_12, status_13_15, status_15_17 FROM rooms WHERE enabled = 1");
        console.log("Fetched rooms:", rows);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching rooms:', error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

app.get('/api/rooms-status', async (req, res) => {
    try {
        // Assuming no specific date handling is needed, just summing up current statuses
        const query = `
        SELECT
        (SUM(status_8_10 = 'Free') + SUM(status_10_12 = 'Free') + SUM(status_13_15 = 'Free') + SUM(status_15_17 = 'Free')) AS free_slots,
        (SUM(status_8_10 = 'Pending') + SUM(status_10_12 = 'Pending') + SUM(status_13_15 = 'Pending') + SUM(status_15_17 = 'Pending')) AS pending_slots,
        (SUM(status_8_10 = 'Reserved') + SUM(status_10_12 = 'Reserved') + SUM(status_13_15 = 'Reserved') + SUM(status_15_17 = 'Reserved')) AS reserved_slots,
        (SUM(status_8_10 = 'Disabled') + SUM(status_10_12 = 'Disabled') + SUM(status_13_15 = 'Disabled') + SUM(status_15_17 = 'Disabled')) AS disabled_slots
    FROM rooms
    WHERE enabled = 1;
    
        `;
        const [results] = await db.query(query);
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).json({ error: "No room statuses found" });
        }
    } catch (error) {
        console.error('Error fetching room statuses:', error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});


app.post('/api/book-room', async (req, res) => {
    const { userId, roomId, timeSlot, reason } = req.body;
    const date = new Date().toISOString().slice(0, 10); // Format for database compatibility

    if (!roomId || !timeSlot || !userId) {
        return res.status(400).json({ error: 'Missing required booking details.' });
    }

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // Check if the user has any approved booking in the booking history for the specified date
        const [approvedHistoryBookings] = await connection.query(
            `SELECT * FROM bookinghistory 
             WHERE user_id = ? AND date = ? AND status = 1`, // 1 stands for approved
            [userId, date]
        );

        if (approvedHistoryBookings.length > 0) {
            await connection.rollback();
            connection.release();
            return res.status(409).json({ error: 'You have already an approved booking for today in booking history.' });
        }

        // Check if the user has any current pending or approved bookings for the specified date
        const [existingBookings] = await connection.query(
            `SELECT * FROM bookings 
             WHERE user_id = ? AND date = ? AND (status = "Pending" OR status = "Approved")`,
            [userId, date]
        );

        if (existingBookings.length > 0) {
            await connection.rollback();
            connection.release();
            return res.status(409).json({ error: 'You already have a pending booking for today.' });
        }

        // Check if there are any conflicting bookings for the requested time slot
        const [conflictingBookings] = await connection.query(
            `SELECT * FROM bookings 
             WHERE date = ? AND time_slot = ? AND (status = "Pending" OR status = "Approved")`,
            [date, timeSlot]
        );

        if (conflictingBookings.length > 0) {
            await connection.rollback();
            connection.release();
            return res.status(409).json({ error: 'Another booking already exists for this time slot.' });
        }

        // Update the status of the booked room to "Pending"
        const statusField = `status_${timeSlot.replace('-', '_')}`;
        await connection.query(
            `UPDATE rooms SET ${statusField} = "Pending" WHERE room_id = ?`,
            [roomId]
        );

        // Insert the booking into the bookings table
        await connection.query(
            `INSERT INTO bookings (room_id, user_id, date, time_slot, reason, status) 
             VALUES (?, ?, ?, ?, ?, "Pending")`,
            [roomId, userId, date, timeSlot, reason || 'No specific reason']
        );

        await connection.commit();
        connection.release();
        res.json({ message: 'Booking successful' });
    } catch (error) {
        console.error('Booking error:', error);
        if (connection) {
            await connection.rollback();
            connection.release();
        }
        res.status(500).json({ error: 'Database error during the booking process', details: error.message });
    }
});




// Approve Booking /api/approve-booking

app.post('/api/approve-booking', async (req, res) => {
    const { bookingId } = req.body;  // Extract bookingId from the request body
    let connection;

    try {
        connection = await db.getConnection();  // Get a connection from the pool
        await connection.beginTransaction();  // Start a transaction

        // Fetch the relevant booking details
        const [bookingDetails] = await connection.query(
            'SELECT * FROM bookings WHERE booking_id = ?',
            [bookingId]
        );

        // Check if booking exists
        if (bookingDetails.length === 0) {
            throw new Error('Booking not found.');
        }
        const booking = bookingDetails[0];

        // Insert into bookinghistory with status set to '1' (approved)
        await connection.query(
            'INSERT INTO bookinghistory (booking_id, room_id, user_id, approver_id, date, time_slot, status, reason) VALUES (?, ?, ?, ?, ?, ?, 1, ?)',
            [booking.booking_id, booking.room_id, booking.user_id, req.session.user.id, booking.date, booking.time_slot, booking.reason]
        );

        // Update the room timeslot status to 'Reserved'
        const timeSlotField = `status_${booking.time_slot.replace('-', '_')}`;
        await connection.query(
            `UPDATE rooms SET ${timeSlotField} = 'Reserved' WHERE room_id = ?`,
            [booking.room_id]
        );

        // Delete the original booking
        await connection.query(
            'DELETE FROM bookings WHERE booking_id = ?',
            [bookingId]
        );

        // If all operations are successful, commit the transaction
        await connection.commit();
        res.json({ success: true, message: 'Booking approved successfully.' });  // Send a success response back to the client
    } catch (error) {
        // On error, rollback the transaction
        if (connection) {
            await connection.rollback();
        }
        console.error('Error approving booking:', error);
        res.status(500).json({ success: false, message: 'Failed to approve booking', details: error.message });
    } finally {
        // Release the connection back to the pool
        if (connection) {
            connection.release();
        }
    }
});



app.post('/api/reject-booking', async (req, res) => {
    const { bookingId } = req.body;
    const approverId = req.session.user?.id;  // Ensure the session contains the user

    if (!bookingId || !approverId) {
        return res.status(400).json({ error: 'Booking ID and approver ID are required' });
    }

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // Fetch the booking details to get the reason and other info
        const [bookings] = await connection.query('SELECT * FROM bookings WHERE booking_id = ?', [bookingId]);
        if (bookings.length === 0) {
            throw new Error('Booking not found');
        }
        const booking = bookings[0];
        console.log('Booking to be rejected:', booking);

        // Insert into bookinghistory with rejection status and the reason from bookings
        await connection.query(
            'INSERT INTO bookinghistory (booking_id, room_id, user_id, approver_id, date, time_slot, status, reason) VALUES (?, ?, ?, ?, CURDATE(), ?, 0, ?)',
            [booking.booking_id, booking.room_id, booking.user_id, approverId, booking.time_slot, booking.reason]
        );

        // Update the room status to 'Free' if needed and delete the booking
        const timeSlotField = `status_${booking.time_slot.replace('-', '_')}`;
        await connection.query(
            `UPDATE rooms SET ${timeSlotField} = 'Free' WHERE room_id = ?`,
            [booking.room_id]
        );

        await connection.query('DELETE FROM bookings WHERE booking_id = ?', [bookingId]);

        await connection.commit();
        res.json({ success: true, message: 'Booking rejected successfully.' });
    } catch (error) {
        await connection.rollback();
        console.error('Failed to reject booking:', error);
        res.status(500).json({ error: 'Failed to reject booking', details: error.message });
    } finally {
        connection.release();
    }
});





app.post('/Register1', async (req, res) => {
    const { username, password, firstname, lastname } = req.body;

    if (!username || !password || !firstname || !lastname) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        const existingUsers = await con.query('SELECT username FROM users WHERE username = ?', [username]);
        if (existingUsers[0].length > 0) {
            return res.status(409).json({ error: 'Username already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await con.query(
            'INSERT INTO users (firstname, lastname, username, password, role) VALUES (?, ?, ?, ?, 1)',
            [firstname, lastname, username, hashedPassword]
        );

        // User is successfully registered, now log them in by setting up the session
        req.session.user = { id: result[0].insertId, username: username, role: 1 }; // Adjust the role if necessary

        console.log("User registered and logged in successfully:", result[0].insertId);
        res.json({ user: { id: result[0].insertId, username: username }, redirect: '/HomepageUser.html' });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: 'Failed to register user.' });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await verifyCredentials(username, password);
        if (user) {
            req.session.user = { id: user.user_id, username: username, role: user.role };
            console.log("Session user set:", req.session.user); // Confirm session is set
            const redirectPath = `/Homepage${user.role === 1 ? 'User' : user.role === 2 ? 'Approver' : 'Staff'}.html`;
            console.log("Redirect path:", redirectPath); // Check what redirect path is being set
            res.json({ user: req.session.user, redirect: redirectPath });
        } else {
            res.status(401).send('Login failed: User not found or password incorrect');
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).send('Internal Server Error');
    }
});

// ADMIN Route

//Add Room
// API endpoint to insert a new room
app.post("/api/add-room", (req, res) => {
    const { room_name, details, time_slots } = req.body;
  
    const enable = 1;
  
    // Determine status based on time_slots
    const status_8_10 = time_slots.includes("8-10") ? "Free" : "Disabled";
    const status_10_12 = time_slots.includes("10-12") ? "Free" : "Disabled";
    const status_13_15 = time_slots.includes("13-15") ? "Free" : "Disabled";
    const status_15_17 = time_slots.includes("15-17") ? "Free" : "Disabled";
  
    // Example SQL query to insert a new room into the database
    const insertRoomQuery = `INSERT INTO rooms (room_name, details, status_8_10, status_10_12, status_13_15, status_15_17)
           VALUES (?, ?, ?, ?, ?, ?)`;
  
    // Execute the SQL query with input parameters
    con.query(
      insertRoomQuery,
      [room_name, details, status_8_10, status_10_12, status_13_15, status_15_17],
      (err, result) => {
        if (err) {
          console.error("Error inserting room:", err);
          return res.status(500).json({ error: "Failed to add room" });
        }
        console.log("New room added:", result);
        return res.status(200).json({ message: "Room added successfully" });
      }
    );
  });
  
  //Enable/Disabled Rooms
  // PUT route to update room status, enable/disable state, and time slot statuses
  app.put(`/api/rooms/:roomName/:roomId/:statusKey`, (req, res) => {
    const roomName = req.params.roomName;
    const roomId = req.params.roomId; 
    const { statuses } = req.body; 
  
    // Prepare SQL query to update room details
    const sql = `
    UPDATE rooms 
    SET  
        status_8_10 = ?, 
        status_10_12 = ?, 
        status_13_15 = ?, 
        status_15_17 = ? 
    WHERE 
        room_name = ? AND
        room_id = ?
  `;
    // Prepare values array for the SQL query
    const values = [
      statuses.status_8_10 === "Free" ? "Free" : "Disabled",
      statuses.status_10_12 === "Free" ? "Free" : "Disabled",
      statuses.status_13_15 === "Free" ? "Free" : "Disabled",
      statuses.status_15_17 === "Free" ? "Free" : "Disabled",
      roomName  ,
      roomId ,
    ];
    // Execute the SQL query with prepared values
    con.query(sql, values, (err, result) => {
      if (err) {
        console.error("Error updating room:", err);
        res.status(500).json({ error: "Failed to update room" });
        return;
      }
      console.log("Room updated successfully");
      console.log(result);
      res.status(200).json({ message: "Room updated successfully" });
    });
  });
  
app.get('/logout', logoutUser);

// Utility routes
app.get('/password/:password', hashPassword);
app.get('/room/:orderingID', getRoomByOrderingID);

// Start server
const PORT =4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});




// Functions








function getRoomStatuses(req, res) {
    const sql = `
        SELECT 
            SUM(CASE WHEN status_8_10 = 'Free' THEN 1 ELSE 0 END) AS free,
            SUM(CASE WHEN status_8_10 = 'Pending' THEN 1 ELSE 0 END) AS pending,
            SUM(CASE WHEN status_8_10 = 'Reserved' THEN 1 ELSE 0 END) AS reserved,
            SUM(CASE WHEN status_8_10 = 'Disabled' THEN 1 ELSE 0 END) AS disabled,
            COUNT(*) AS total
        FROM rooms;
    `;
    con.query(sql, handleQueryResponse(res));
}




function getPendingRequests(req, res) {
    const sql = "SELECT * FROM bookings WHERE status = 'Pending'";
    con.query(sql, handleQueryResponse(res));
}

function getResolvedRequests(req, res) {
    const sql = `
        SELECT b.*, r.room_name, u.firstname, u.lastname
        FROM bookings b
        JOIN rooms r ON b.room_id = r.room_id
        JOIN users u ON b.user_id = u.user_id
        WHERE b.status IN ('Approved', 'Rejected')
        ORDER BY b.date DESC, b.time_slot;
    `;
    con.query(sql, handleQueryResponse(res));
}

function logoutUser(req, res) {
    req.session.destroy(function (err) {
        if (err) {
            console.error(err);
            res.status(500).send("Cannot clear session");
        } else {
            res.redirect("/");
        }
    });
}

function hashPassword(req, res) {
    const plainPassword = req.params.password;
    bcrypt.hash(plainPassword, 10, (err, hashedPassword) => {
        if (err) {
            console.error("Error hashing password:", error);
            res.status(500).send("Server error hashing password");
        } else {
            res.send(hashedPassword);
        }
    });
}

function getRoomByOrderingID(req, res) {
    const orderingID = req.params.orderingID;
    const sql = "SELECT room.room_id, room.room_name, room.status FROM room INNER JOIN booking ON room.room_id = booking.room_id WHERE booking.ordering_id = ?";
    con.query(sql, [orderingID], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Database server error");
        }
        res.json(results);
    });
}

function handleQueryResponse(res) {
    return (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ error: "Database server error: " + err.message });
        }
        res.json(results);
    };
}


app.post("/api/add-room", (req, res) => {
    const { room_name, details, time_slots } = req.body;
  
    const enable = 1;
  
    // Determine status based on time_slots
    const status_8_10 = time_slots.includes("8-10") ? "Free" : "Disabled";
    const status_10_12 = time_slots.includes("10-12") ? "Free" : "Disabled";
    const status_13_15 = time_slots.includes("13-15") ? "Free" : "Disabled";
    const status_15_17 = time_slots.includes("15-17") ? "Free" : "Disabled";
  
    // Example SQL query to insert a new room into the database
    const insertRoomQuery = `INSERT INTO rooms (room_name, details, status_8_10, status_10_12, status_13_15, status_15_17)
           VALUES (?, ?, ?, ?, ?, ?)`;
  
    // Execute the SQL query with input parameters
    con.query(
      insertRoomQuery,
      [room_name, details, status_8_10, status_10_12, status_13_15, status_15_17],
      (err, result) => {
        if (err) {
          console.error("Error inserting room:", err);
          return res.status(500).json({ error: "Failed to add room" });
        }
        console.log("New room added:", result);
        return res.status(200).json({ message: "Room added successfully" });
      }
    );
  });
  
// PUT route to update room status, enable/disable state, and time slot statuses
app.put('/api/rooms/:roomId', (req, res) => {
    const { roomId } = req.params;
    const { statuses } = req.body;

    if (!roomId || !statuses) {
        return res.status(400).json({ error: 'Missing room id or statuses' });
    }

    const sql = `UPDATE rooms SET status_8_10 = ?, status_10_12 = ?, status_13_15 = ?, status_15_17 = ? WHERE room_id = ?`;
    const values = [
        statuses.status_8_10 === 'Free' ? 'Free' : 'Disabled',
        statuses.status_10_12 === 'Free' ? 'Free' : 'Disabled',
        statuses.status_13_15 === 'Free' ? 'Free' : 'Disabled',
        statuses.status_15_17 === 'Free' ? 'Free' : 'Disabled',
        roomId
    ];

    con.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error updating room:', err);
            return res.status(500).json({ error: 'Failed to update room', details: err.message });
        }
        console.log('Room updated successfully');
        return res.status(200).json({ message: 'Room updated successfully' });
    });
});

app.post('/api/rooms/update/:roomId', (req, res) => {
    const { roomId } = req.params;
    const { roomType, details, img } = req.body;

    let updates = [];
    let parameters = [];

    if (roomType) {
        updates.push("room_name = ?");
        parameters.push(roomType);
    }

    if (details) {
        updates.push("details = ?");
        parameters.push(details);
    }

    if (img) {
        updates.push("img = ?");
        parameters.push(img);
    }

    if (updates.length === 0) {
        res.status(400).send('No update information provided');
        return;
    }

    parameters.push(parseInt(roomId, 10));
    const sql = `UPDATE rooms SET ${updates.join(', ')} WHERE room_id = ?`;

    db.query(sql, parameters, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            res.status(500).send('Database error');
            return;
        }
        if (result.affectedRows) {
            res.send('Room updated successfully');
        } else {
            res.status(404).send('Room not found');
        }
    });
});

app.post('/api/rooms/status/:roomId', (req, res) => {
    const roomId = req.params.roomId;
    const { statusKey, newStatus } = req.body;

    const updateSql = `UPDATE rooms SET ${statusKey} = ? WHERE room_id = ?`;
    db.query(updateSql, [newStatus, roomId], (error, results) => {
        if (error) {
            console.error('Error updating status:', error);
            return res.status(500).json({ success: false, error: 'Database operation failed' });
        }
        if (results.affectedRows > 0) {
            return res.status(200).json({ success: true, message: 'Status updated successfully' });
        } else {
            return res.status(404).json({ success: false, error: 'No room found or no change needed' });
        }
    });
});

app.post('/api/rooms/add', (req, res) => {
    const { roomType, details, img } = req.body; // เพิ่มการรับค่า img ด้วย

    // Construct the SQL query to insert a new room
    const query = `
        INSERT INTO rooms (room_name, details, enabled, status_8_10, status_10_12, status_13_15, status_15_17, img)
        VALUES (?, ?, 1, 'Free', 'Free', 'Free', 'Free', ?);
    `;

    // Execute the query to insert the new room
    db.query(query, [roomType, details, img], (err, result) => { // ใส่ img ใน array ของ parameters
        if (err) {
            console.error('Error adding new room:', err);
            return res.status(500).json({ success: false, error: 'Database error occurred.' });
        }
        console.log('Room added successfully:', result);
        res.status(201).json({ success: true, message: 'Room added successfully', data: result });
    });
});


app.delete('/api/rooms/delete/:roomId', async (req, res) => {
    const roomId = req.params.roomId;

    try {
        const [roomStatus] = await db.query('SELECT status_8_10, status_10_12, status_13_15, status_15_17 FROM rooms WHERE room_id = ?', [roomId]);
        const status = roomStatus[0];
        if (Object.values(status).every(val => val === 'Free' || val === 'Disabled')) {
            await db.query('DELETE FROM rooms WHERE room_id = ?', [roomId]);
            res.json({ success: true, message: 'Room deleted successfully' });
        } else {
            res.status(400).json({ success: false, error: 'Room cannot be deleted unless all time slots are Free or Disabled' });
        }
    } catch (error) {
        console.error('Failed to delete room:', error);
        res.status(500).json({ success: false, error: 'Failed to delete room' });
    }
});
