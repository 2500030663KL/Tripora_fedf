function getData(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

function setData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function signup() {
    let username = document.getElementById("username").value.trim();
    let password = document.getElementById("password").value;
    let msg = document.getElementById("msg");

    if (!username || !password) {
        msg.innerText = "Enter username and password";
        return;
    }

    let users = getData("users");
    let exists = users.find(function(user) {
        return user.username === username;
    });

    if (exists) {
        msg.innerText = "Username already exists";
        return;
    }

    users.push({
        username: username,
        password: password
    });

    setData("users", users);
    msg.innerText = "Signup successful. Now login.";
}

function login() {
    let username = document.getElementById("username").value.trim();
    let password = document.getElementById("password").value;
    let msg = document.getElementById("msg");

    let users = getData("users");
    let user = users.find(function(u) {
        return u.username === username && u.password === password;
    });

    if (!user) {
        msg.innerText = "Invalid username or password";
        return;
    }

    localStorage.setItem("currentUser", username);
    location.href = "user.html";
}

function logout() {
    localStorage.removeItem("currentUser");
    location.href = "index.html";
}

function loadDashboard() {
    let user = localStorage.getItem("currentUser");
    if (!user) {
        location.href = "index.html";
        return;
    }
    let welcome = document.getElementById("welcomeUser");
    if (welcome) {
        welcome.innerText = user;
    }
}

function goTransport(type) {
    localStorage.setItem("transportType", type);
    location.href = "transport.html";
}

function loadTransport() {
    let type = localStorage.getItem("transportType") || "Travel";
    let title = document.getElementById("transportTitle");
    title.innerText = type + " Booking";

    if (type === "Rapido" || type === "Uber") {
        document.getElementById("dateBox").style.display = "none";
        document.getElementById("tripBox").style.display = "none";
    }
}

function useCurrentLocation() {
    document.getElementById("from").value = "Vijayawada";
}

function searchTravel() {
    let type = localStorage.getItem("transportType");
    let from = document.getElementById("from").value;
    let to = document.getElementById("to").value;
    let date = document.getElementById("travelDate") ? document.getElementById("travelDate").value : "";
    let sort = document.getElementById("sortBy").value;

    if (!from || !to) {
        alert("Select From and To");
        return;
    }

    if (from === to) {
        alert("From and To cannot be same");
        return;
    }

    if (type !== "Rapido" && type !== "Uber" && !date) {
        alert("Select travel date");
        return;
    }

    let recent = getData("recentSearches");
    recent.unshift({
        type: type,
        from: from,
        to: to,
        date: date
    });
    recent = recent.slice(0, 5);
    setData("recentSearches", recent);

    if (type === "Rapido" || type === "Uber") {
        showRideOptions(type, from, to);
        return;
    }

    showTravelOptions(type, from, to, date, sort);
}

function showTravelOptions(type, from, to, date, sort) {
    let adminTravel = getData("adminTravel");
    let options = adminTravel.filter(function(t) {
        return t.transportType === type &&
               t.from.toLowerCase() === from.toLowerCase() &&
               t.to.toLowerCase() === to.toLowerCase();
    });

    if (options.length === 0) {
        options = getDefaultTravel(type, from, to);
    }

    if (sort === "cheapest") {
        options.sort(function(a, b) {
            return a.price - b.price;
        });
    }

    if (sort === "fastest") {
        options.sort(function(a, b) {
            return a.duration - b.duration;
        });
    }

    let results = document.getElementById("results");
    results.innerHTML = "";

    options.forEach(function(option) {
        results.innerHTML += `
        <div class="result-card">
            <h2>${option.name}</h2>
            <p>${option.from} → ${option.to}</p>
            <p>Departure: ${option.departure}</p>
            <p>Arrival: ${option.arrival}</p>
            <p>Duration: ${option.duration} minutes</p>
            <h3>₹${option.price}</h3>
            <button onclick='selectTravel(${JSON.stringify(option)})'>
                Select
            </button>
        </div>
        `;
    });
}

function getDefaultTravel(type, from, to) {
    if (type === "Train") {
        return [
            {
                name: "Guntur Express",
                from: from,
                to: to,
                departure: "06:30 AM",
                arrival: "10:30 AM",
                duration: 240,
                price: 450
            },
            {
                name: "Superfast Express",
                from: from,
                to: to,
                departure: "09:00 AM",
                arrival: "12:15 PM",
                duration: 195,
                price: 600
            },
            {
                name: "Intercity Express",
                from: from,
                to: to,
                departure: "02:00 PM",
                arrival: "06:30 PM",
                duration: 270,
                price: 400
            }
        ];
    }

    return [
        {
            name: "APSRTC Express",
            from: from,
            to: to,
            departure: "07:00 AM",
            arrival: "11:00 AM",
            duration: 240,
            price: 350
        },
        {
            name: "Orange Travels",
            from: from,
            to: to,
            departure: "09:30 AM",
            arrival: "01:00 PM",
            duration: 210,
            price: 500
        },
        {
            name: "Night Rider",
            from: from,
            to: to,
            departure: "10:00 PM",
            arrival: "02:00 AM",
            duration: 240,
            price: 450
        }
    ];
}

function selectTravel(option) {
    let from = document.getElementById("from").value;
    let to = document.getElementById("to").value;
    let date = document.getElementById("travelDate").value;
    let tripType = document.getElementById("tripType").value;

    let selected = {
        ...option,
        from: from,
        to: to,
        travelDate: date,
        tripType: tripType,
        transportType: localStorage.getItem("transportType")
    };

    localStorage.setItem("selectedTravel", JSON.stringify(selected));

    if (localStorage.getItem("transportType") === "Bus") {
        showBusSeats();
    } else {
        location.href = "passenger.html";
    }
}

function showBusSeats() {
    let section = document.getElementById("seatSection");
    section.innerHTML = `
        <h2>Select Bus Seats</h2>
        <div class="seat-grid">
            ${createSeats()}
        </div>
        <p id="seatMessage"></p>
        <button onclick="continueBusSeats()">Continue</button>
    `;
}

function createSeats() {
    let html = "";
    for (let i = 1; i <= 20; i++) {
        html += `
        <div class="seat" onclick="selectSeat(this, ${i})">
            ${i}
        </div>
        `;
    }
    return html;
}

function selectSeat(element, seatNumber) {
    if (element.classList.contains("booked")) {
        return;
    }

    element.classList.toggle("selected");
    let seats = getData("selectedSeats");
    let index = seats.indexOf(seatNumber);

    if (index === -1) {
        seats.push(seatNumber);
    } else {
        seats.splice(index, 1);
    }

    setData("selectedSeats", seats);
}

function continueBusSeats() {
    let seats = getData("selectedSeats");
    if (seats.length === 0) {
        alert("Select at least one seat");
        return;
    }
    location.href = "passenger.html";
}

function loadPassenger() {
    let selected = JSON.parse(localStorage.getItem("selectedTravel"));
    if (!selected) {
        location.href = "user.html";
        return;
    }

    let summary = document.getElementById("passengerSummary");
    summary.innerHTML = `
        <h2>${selected.name}</h2>
        <p>${selected.from} → ${selected.to}</p>
        <p>Date: ${selected.travelDate || "Today"}</p>
        <p>Price per person: ₹${selected.price}</p>
    `;

    createPassengerFields();
}

function createPassengerFields() {
    let count = Number(document.getElementById("passengerCount").value);
    let box = document.getElementById("passengerFields");
    box.innerHTML = "";

    for (let i = 1; i <= count; i++) {
        box.innerHTML += `
        <div class="passenger-box">
            <h3>Passenger ${i}</h3>
            <input class="passenger-name" placeholder="Full Name">
            <input class="passenger-age" type="number" placeholder="Age">
            <select class="passenger-gender">
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
            </select>
        </div>
        `;
    }
}

function continuePassenger() {
    let names = document.querySelectorAll(".passenger-name");
    let ages = document.querySelectorAll(".passenger-age");
    let genders = document.querySelectorAll(".passenger-gender");
    let passengers = [];

    for (let i = 0; i < names.length; i++) {
        if (!names[i].value || !ages[i].value || !genders[i].value) {
            alert("Enter all passenger details");
            return;
        }

        passengers.push({
            name: names[i].value,
            age: ages[i].value,
            gender: genders[i].value
        });
    }

    let selected = JSON.parse(localStorage.getItem("selectedTravel"));
    let promo = document.getElementById("promo").value.trim();
    let discount = 0;

    if (promo === "TRAVEL10") {
        discount = selected.price * passengers.length * 0.10;
    }

    if (promo === "FIRST50") {
        discount = 50;
    }

    let seatCount = getData("selectedSeats").length;
    let baseFare = selected.price * passengers.length;

    if (selected.transportType === "Bus" && seatCount > 0) {
        if (seatCount !== passengers.length) {
            alert("Number of seats and passengers must match");
            return;
        }
    }

    let total = Math.max(0, baseFare - discount);

    let pending = {
        ...selected,
        passengers: passengers,
        promo: promo,
        discount: discount,
        baseFare: baseFare,
        totalFare: total,
        selectedSeats: getData("selectedSeats")
    };

    localStorage.setItem("pendingBooking", JSON.stringify(pending));
    location.href = "payment.html";
}

function loadPayment() {
    let booking = JSON.parse(localStorage.getItem("pendingBooking"));
    if (!booking) {
        location.href = "user.html";
        return;
    }

    document.getElementById("paymentSummary").innerHTML = `
        <h2>${booking.name}</h2>
        <p>${booking.from} → ${booking.to}</p>
        <p>Passengers: ${booking.passengers.length}</p>
        <p>Base Fare: ₹${booking.baseFare}</p>
        <p>Discount: ₹${booking.discount}</p>
        <h2>Total: ₹${booking.totalFare}</h2>
    `;
}

function paymentFields() {
    let method = document.getElementById("paymentMethod").value;
    let box = document.getElementById("paymentInput");

    if (method === "UPI") {
        box.innerHTML = `<input id="paymentValue" placeholder="Enter UPI ID">`;
    } else if (method === "Card") {
        box.innerHTML = `
            <input id="paymentValue" placeholder="Card Number">
            <input placeholder="Expiry MM/YY">
            <input placeholder="CVV">
        `;
    } else {
        box.innerHTML = `
            <select id="paymentValue">
                <option>SBI</option>
                <option>HDFC</option>
                <option>ICICI</option>
                <option>Axis Bank</option>
            </select>
        `;
    }
}

function payNow() {
    let booking = JSON.parse(localStorage.getItem("pendingBooking"));
    if (!booking) return;

    let method = document.getElementById("paymentMethod").value;
    let value = document.getElementById("paymentValue").value;

    if (!value) {
        alert("Enter payment details");
        return;
    }

    let username = localStorage.getItem("currentUser");
    let finalBooking = {
        id: Date.now(),
        username: username,
        ...booking,
        paymentMethod: method,
        paymentStatus: "Paid",
        status: "Confirmed",
        bookingTime: new Date().toLocaleString()
    };

    let bookings = getData("bookings");
    bookings.push(finalBooking);
    setData("bookings", bookings);

    if (booking.transportType === "Rapido" || booking.transportType === "Uber") {
        localStorage.setItem("currentRide", JSON.stringify(finalBooking));
        localStorage.removeItem("pendingBooking");
        location.href = "ride.html";
        return;
    }

    localStorage.removeItem("pendingBooking");
    localStorage.removeItem("selectedSeats");

    document.getElementById("paymentMsg").innerText = "Payment successful! Booking confirmed.";
    setTimeout(function() {
        location.href = "mybookings.html";
    }, 1200);
}

function showRideOptions(type, from, to) {
    let options;
    if (type === "Rapido") {
        options = [
            { name: "Rapido Bike", vehicle: "Bike", price: 120, duration: 25 },
            { name: "Rapido Auto", vehicle: "Auto", price: 180, duration: 30 },
            { name: "Rapido Cab", vehicle: "Cab", price: 280, duration: 25 }
        ];
    } else {
        options = [
            { name: "Uber Auto", vehicle: "Auto", price: 150, duration: 30 },
            { name: "Uber Go", vehicle: "Go", price: 220, duration: 25 },
            { name: "Uber Sedan", vehicle: "Sedan", price: 350, duration: 25 }
        ];
    }

    let results = document.getElementById("results");
    results.innerHTML = "";

    options.forEach(function(option) {
        results.innerHTML += `
        <div class="result-card">
            <h2>${option.name}</h2>
            <p>${from} → ${to}</p>
            <p>Vehicle: ${option.vehicle}</p>
            <p>Estimated time: ${option.duration} minutes</p>
            <h3>₹${option.price}</h3>
            <button onclick='selectRide(${JSON.stringify(option)})'>
                Book Ride
            </button>
        </div>
        `;
    });
}

function selectRide(option) {
    let from = document.getElementById("from").value;
    let to = document.getElementById("to").value;

    let booking = {
        name: option.name,
        vehicle: option.vehicle,
        from: from,
        to: to,
        price: option.price,
        duration: option.duration,
        transportType: localStorage.getItem("transportType"),
        travelDate: "",
        passengers: [
            {
                name: localStorage.getItem("currentUser"),
                age: "",
                gender: ""
            }
        ],
        baseFare: option.price,
        discount: 0,
        totalFare: option.price,
        selectedSeats: []
    };

    localStorage.setItem("pendingBooking", JSON.stringify(booking));
    location.href = "payment.html";
}

function loadRide() {
    let ride = JSON.parse(localStorage.getItem("currentRide"));
    if (!ride) {
        location.href = "user.html";
        return;
    }

    document.getElementById("rideName").innerText = ride.name;
    document.getElementById("mapPanel").style.display = "none";
    document.getElementById("completionPanel").style.display = "none";
}

function verifyOTP() {
    let otp = document.getElementById("rideOtp").value;
    let msg = document.getElementById("otpMsg");

    if (otp === "1234") {
        msg.innerText = "OTP verified successfully";
        document.getElementById("mapPanel").style.display = "block";
    } else {
        msg.innerText = "Invalid OTP";
    }
}

function openGoogleMaps() {
    let ride = JSON.parse(localStorage.getItem("currentRide"));
    if (!ride) return;

    let url = "https://www.google.com/maps/dir/?api=1" +
              "&origin=" + encodeURIComponent(ride.from) +
              "&destination=" + encodeURIComponent(ride.to);
    window.open(url, "_blank");
}

function startRide() {
    let ride = JSON.parse(localStorage.getItem("currentRide"));
    if (!ride) return;

    document.getElementById("completionPanel").style.display = "block";
    document.getElementById("finalFare").innerText = "Final Fare: ₹" + ride.totalFare;
}

function finishRide() {
    let ride = JSON.parse(localStorage.getItem("currentRide"));
    if (!ride) return;

    let bookings = getData("bookings");
    let index = bookings.findIndex(function(b) {
        return b.id === ride.id;
    });

    if (index !== -1) {
        bookings[index].status = "Completed";
        setData("bookings", bookings);
    }

    localStorage.removeItem("currentRide");
    location.href = "mybookings.html";
}

function loadBookings() {
    let username = localStorage.getItem("currentUser");
    if (!username) {
        location.href = "index.html";
        return;
    }

    let bookings = getData("bookings");
    let userBookings = bookings.filter(function(b) {
        return b.username === username;
    });

    let box = document.getElementById("bookingList");
    if (userBookings.length === 0) {
        box.innerHTML = "<div class='booking-summary'><h2>No bookings yet</h2></div>";
        return;
    }

    box.innerHTML = "";
    userBookings.forEach(function(booking) {
        let passengers = booking.passengers || [];
        let names = passengers.map(function(p) {
            return p.name;
        }).join(", ");

        box.innerHTML += `
        <div class="booking-summary">
            <h2>🎫 ${booking.name}</h2>
            <p><b>Transport:</b> ${booking.transportType}</p>
            <p><b>From:</b> ${booking.from}</p>
            <p><b>To:</b> ${booking.to}</p>
            <p><b>Date:</b> ${booking.travelDate || "Today"}</p>
            <p><b>Passengers:</b> ${names}</p>
            <p><b>Seats:</b> ${(booking.selectedSeats || []).join(", ") || "N/A"}</p>
            <p><b>Payment:</b> ${booking.paymentMethod}</p>
            <h3>₹${booking.totalFare}</h3>
            <p><b>Status:</b> ${booking.status}</p>
        </div>
        `;
    });
}

function showRecent() {
    let recent = getData("recentSearches");
    let box = document.getElementById("dashboardMsg");

    if (recent.length === 0) {
        box.innerText = "No recent searches";
        return;
    }

    box.innerHTML = "<b>Recent Searches:</b><br>" +
        recent.map(function(r) {
            return r.type + ": " + r.from + " → " + r.to;
        }).join("<br>");
}

function adminSignup() {
    let name = document.getElementById("adminName").value.trim();
    let email = document.getElementById("adminEmail").value.trim();
    let password = document.getElementById("adminPassword").value;
    let confirm = document.getElementById("adminConfirmPassword").value;
    let msg = document.getElementById("adminSignupMsg");

    if (!name || !email || !password || !confirm) {
        msg.innerText = "Please fill all fields";
        return;
    }

    if (password !== confirm) {
        msg.innerText = "Passwords do not match";
        return;
    }

    let admins = getData("admins");
    let exists = admins.find(function(admin) {
        return admin.email === email;
    });

    if (exists) {
        msg.innerText = "Admin already exists";
        return;
    }

    admins.push({
        name: name,
        email: email,
        password: password
    });

    setData("admins", admins);
    msg.innerText = "Admin account created successfully";

    setTimeout(function() {
        location.href = "admin-login.html";
    }, 1000);
}

function adminLogin() {
    let email = document.getElementById("adminLoginEmail").value.trim();
    let password = document.getElementById("adminLoginPassword").value;
    let msg = document.getElementById("adminMsg");

    let admins = getData("admins");
    let admin = admins.find(function(a) {
        return a.email === email && a.password === password;
    });

    if (!admin) {
        msg.innerText = "Invalid admin email or password";
        return;
    }

    localStorage.setItem("currentAdmin", JSON.stringify(admin));
    location.href = "admin.html";
}

function loadAdmin() {
    let admin = JSON.parse(localStorage.getItem("currentAdmin"));
    if (!admin) {
        location.href = "admin-login.html";
        return;
    }

    document.getElementById("adminWelcome").innerText = admin.name;
    loadAdminStatistics();
    loadAdminUsers();
    loadAdminBookings();
    loadAdminTravel();
}

function adminLogout() {
    localStorage.removeItem("currentAdmin");
    location.href = "admin-login.html";
}

function loadAdminStatistics() {
    let users = getData("users");
    let bookings = getData("bookings");
    let revenue = 0;
    let completed = 0;

    bookings.forEach(function(booking) {
        revenue += Number(booking.totalFare || 0);
        if (booking.status === "Completed") {
            completed++;
        }
    });

    document.getElementById("totalUsers").innerText = users.length;
    document.getElementById("totalBookings").innerText = bookings.length;
    document.getElementById("totalRevenue").innerText = "₹" + revenue;
    document.getElementById("completedRides").innerText = completed;
}

function loadAdminUsers() {
    let users = getData("users");
    let bookings = getData("bookings");
    let box = document.getElementById("adminUserList");

    if (users.length === 0) {
        box.innerHTML = "<p>No registered users found.</p>";
        return;
    }

    box.innerHTML = "";
    users.forEach(function(user, index) {
        let userBookings = bookings.filter(function(booking) {
            return booking.username === user.username;
        });

        box.innerHTML += `
        <div class="admin-user">
            <h3>👤 User ${index + 1}</h3>
            <p><b>Username:</b> ${user.username}</p>
            <p><b>Total Bookings:</b> ${userBookings.length}</p>
        </div>
        `;
    });
}

function loadAdminBookings() {
    let bookings = getData("bookings");
    let box = document.getElementById("adminBookingList");

    if (bookings.length === 0) {
        box.innerHTML = "<p>No bookings available.</p>";
        return;
    }

    box.innerHTML = "";
    bookings.forEach(function(booking, index) {
        let passengers = booking.passengers || [];
        let passengerNames = passengers.map(function(p) {
            return p.name;
        }).join(", ");

        box.innerHTML += `
        <div class="admin-booking">
            <h3>🎫 Booking ${index + 1}</h3>
            <p><b>User:</b> ${booking.username || "N/A"}</p>
            <p><b>Transport:</b> ${booking.transportType || "N/A"}</p>
            <p><b>Travel:</b> ${booking.name || "N/A"}</p>
            <p><b>From:</b> ${booking.from || "N/A"}</p>
            <p><b>To:</b> ${booking.to || "N/A"}</p>
            <p><b>Travel Date:</b> ${booking.travelDate || "Today"}</p>
            <p><b>Passengers:</b> ${passengerNames || "N/A"}</p>
            <p><b>Number of Passengers:</b> ${passengers.length}</p>
            <p><b>Seats:</b> ${(booking.selectedSeats || []).join(", ") || "N/A"}</p>
            <p><b>Payment:</b> ${booking.paymentMethod || "N/A"}</p>
            <p><b>Payment Status:</b> ${booking.paymentStatus || "N/A"}</p>
            <p><b>Fare:</b> ₹${booking.totalFare || 0}</p>
            <p><b>Status:</b> ${booking.status || "Confirmed"}</p>
            <p><b>Booking Time:</b> ${booking.bookingTime || "N/A"}</p>
        </div>
        `;
    });
}

function addTravelOption() {
    let type = document.getElementById("adminType").value;
    let name = document.getElementById("adminTravelName").value.trim();
    let from = document.getElementById("adminFrom").value.trim();
    let to = document.getElementById("adminTo").value.trim();
    let departure = document.getElementById("adminDeparture").value.trim();
    let arrival = document.getElementById("adminArrival").value.trim();
    let duration = Number(document.getElementById("adminDuration").value);
    let price = Number(document.getElementById("adminPrice").value);
    let msg = document.getElementById("adminTravelMsg");

    if (!name || !from || !to || !departure || !arrival || !duration || !price) {
        msg.innerText = "Please fill all fields";
        return;
    }

    let travels = getData("adminTravel");
    travels.push({
        id: Date.now(),
        transportType: type,
        name: name,
        from: from,
        to: to,
        departure: departure,
        arrival: arrival,
        duration: duration,
        price: price
    });

    setData("adminTravel", travels);
    msg.innerText = "Travel option added successfully";

    document.getElementById("adminTravelName").value = "";
    document.getElementById("adminFrom").value = "";
    document.getElementById("adminTo").value = "";
    document.getElementById("adminDeparture").value = "";
    document.getElementById("adminArrival").value = "";
    document.getElementById("adminDuration").value = "";
    document.getElementById("adminPrice").value = "";

    loadAdminTravel();
}

function loadAdminTravel() {
    let travels = getData("adminTravel");
    let box = document.getElementById("adminTravelList");

    if (travels.length === 0) {
        box.innerHTML = "<p>No travel options added yet.</p>";
        return;
    }

    box.innerHTML = "";
    travels.forEach(function(travel) {
        box.innerHTML += `
        <div class="admin-travel">
            <h3>${travel.transportType} - ${travel.name}</h3>
            <p>${travel.from} → ${travel.to}</p>
            <p>Departure: ${travel.departure}</p>
            <p>Arrival: ${travel.arrival}</p>
            <p>Duration: ${travel.duration} minutes</p>
            <p>Price: ₹${travel.price}</p>
            <button onclick="deleteTravel(${travel.id})">Delete</button>
        </div>
        `;
    });
}

function deleteTravel(id) {
    let travels = getData("adminTravel");
    travels = travels.filter(function(travel) {
        return travel.id !== id;
    });
    setData("adminTravel", travels);
    loadAdminTravel();
}