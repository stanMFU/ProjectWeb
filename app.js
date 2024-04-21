const express = require("express");
const con = require("./config/db");
const app = express();
const path = require("path");
const bcrypt = require('bcrypt');

app.use("/public", express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/homeuser", function (req, res) {
    res.sendFile(path.join(__dirname, "HomepageUser.html"));
});
app.get("/dashboard", function (req, res) {
    res.sendFile(path.join(__dirname, "dashboard.html"));
});
app.get("/home", function (req, res) {
    res.sendFile(path.join(__dirname, "homepage.html"));
});
app.get("/homestaff", function (req, res) {
    res.sendFile(path.join(__dirname, "HomepageStaff.html"));
});

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "login.html"));
});

app.get("/Register", function (req, res) {
    res.sendFile(path.join(__dirname, "Registor.html"));
});

app.post("/Register1", async function (req, res) {
    const username = req.body.username;
    const password = req.body.password;

    // เข้ารหัสรหัสผ่านก่อนบันทึกลงฐานข้อมูล
    try {
        const hashedPassword = await bcrypt.hash(password, 10); // 10 คือค่าความปลอดภัยของการเข้ารหัส

        // ตรวจสอบว่า username มีอยู่ในฐานข้อมูลแล้วหรือไม่
        const checkUsernameQuery = "SELECT * FROM users WHERE Username = ?";
        con.query(checkUsernameQuery, [username], async function (err, result) {
            if (err) {
                console.error("Error executing query:", err);
                return res.status(500).send("Error checking username");
            }

            if (result.length > 0) {
                console.log("Username already exists:", username);
                return res.status(400).send("Username already exists");
            }

            // ถ้า username ยังไม่มีในฐานข้อมูล ก็ทำการลงทะเบียน
            const sql = "INSERT INTO users (ID, Firstname, Lastname, Username, Password, Role) VALUES (?, ?, ?, ?, ?, ?)";
            const id = generateID();
            const firstname = req.body.firstname;
            const lastname = req.body.lastname;
            const role = 1;

            con.query(sql, [id, firstname, lastname, username, hashedPassword, role], function (err, result) {
                if (err) {
                    console.error("Error executing query:", err);
                    return res.status(500).send("Error registering user");
                }
                console.log("User registered successfully");
                res.send("Registered successfully");
            });
        });
    } catch (error) {
        console.error("Error hashing password:", error);
        res.status(500).send("Error hashing password");
    }
});


function generateID() {
    let id = "";
    const digits = "0123456789";
    for (let i = 0; i < 11; i++) {
        id += digits[Math.floor(Math.random() * 9)];
    }
    return id;
}

app.post('/login', function(req, res) {
    const username = req.body.username;
    const password = req.body.password;

    const sql = "SELECT id,role,password FROM users WHERE Username=?";
    con.query(sql, [username], async function(err, results) {
        if(err) {
            console.error(err);
            res.status(500).send('Server error');
        } else {
            if(results.length === 0) {
                res.status(401).send('Login failed: username or password is wrong');
            } else {
                const hashedPassword = results[0].password;
                try {
                    const match = await bcrypt.compare(password, hashedPassword);
                    if (match) {
                        res.status(200).send('Login OK');
                    } else {
                        res.status(401).send('Login failed: username or password is wrong');
                    }
                } catch (error) {
                    console.error("Error comparing passwords:", error);
                    res.status(500).send('Error comparing passwords');
                }
            }
        }
        
    });
});

const port = 3000;
app.listen(port, function () {
    console.log("Server is ready at " + port);
});
