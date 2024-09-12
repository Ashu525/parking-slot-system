const express = require("express");
const fs = require("fs");
const app = express();
app.use(express.urlencoded({ extended: true }));

const filePath = "./parkingSlots.json";
0;

// Helper function to read from file
const getParkingSlots = () => {
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
};

// Helper function to write to file
const saveParkingSlots = (slots) => {
  fs.writeFileSync(filePath, JSON.stringify(slots));
};

// Initialize parking slots
app.post("/init", (req, res) => {
  const { totalSlots } = req.body;
  if (!totalSlots || totalSlots <= 0) {
    return res.status(400).json({ error: "Invalid number of slots" });
  }

  const parkingSlots = new Array(parseInt(totalSlots)).fill(null);
  saveParkingSlots(parkingSlots);
  return res.json({ message: `${totalSlots} slots initialized successfully` });
});

// Park a vehicle
app.post("/park", (req, res) => {
  const parkingSlots = getParkingSlots();
  const { licensePlate } = req.body;

  if (!licensePlate) {
    return res.status(400).json({ error: "License plate number is required" });
  }

  const availableSlot = parkingSlots.findIndex((slot) => slot === null);
  if (availableSlot === -1) {
    return res.status(400).json({ error: "Parking lot is full" });
  }

  parkingSlots[availableSlot] = licensePlate;
  saveParkingSlots(parkingSlots);
  return res.json({ message: `Vehicle parked at slot ${availableSlot + 1}` });
});

// Unpark a vehicle
app.post("/unpark", (req, res) => {
  const parkingSlots = getParkingSlots();
  const { slotNumber } = req.body;
  if (slotNumber) parseInt(slotNumber);

  if (slotNumber < 1 || slotNumber > parkingSlots.length) {
    return res.status(400).json({ error: "Invalid slot number" });
  }

  const slotIndex = slotNumber - 1;
  if (parkingSlots[slotIndex] === null) {
    return res.status(400).json({ error: "Slot is already empty" });
  }

  parkingSlots[slotIndex] = null;
  saveParkingSlots(parkingSlots);
  return res.json({ message: `Vehicle removed from slot ${slotNumber}` });
});

// Check available slots
app.get("/available-slots", (req, res) => {
  const parkingSlots = getParkingSlots();
  const availableSlots = parkingSlots
    .map((slot, index) => (slot === null ? index + 1 : null))
    .filter((slot) => slot !== null);

  return res.json({ availableSlots });
});

// Get vehicle info by slot number
app.get("/vehicle-info/:slotNumber", (req, res) => {
  const parkingSlots = getParkingSlots();
  const slotNumber = parseInt(req.params.slotNumber);

  if (slotNumber < 1 || slotNumber > parkingSlots.length) {
    return res.status(400).json({ error: "Invalid slot number" });
  }

  const slotIndex = slotNumber - 1;
  const vehicle = parkingSlots[slotIndex];

  if (vehicle === null) {
    return res.json({ message: "Slot is empty" });
  }

  return res.json({ vehicle });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
