const Registration = require("../models/Registration.js");
const Event = require('../models/Event');
const User = require('../models/User');

// Register user for event & generate QR
const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.userId; // from JWT auth middleware

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if already registered
    const existingRegistration = await Registration.findOne({ 
      user: userId, 
      event: eventId 
    });
    
    if (existingRegistration) {
      return res.status(400).json({ 
        message: 'Already registered for this event',
        registration: existingRegistration
      });
    }

    // Generate QR code data (combination of event ID, user ID, and timestamp)
    const qrData = JSON.stringify({
      eventId,
      userId,
      timestamp: new Date().getTime()
    });

    const registration = new Registration({
      event: eventId,
      user: userId,
      qrCode: qrData,
      status: 'registered'
    });

    await registration.save();

    // Populate the registration with user and event details
    const populatedRegistration = await Registration.findById(registration._id)
      .populate('user', 'name email')
      .populate('event', 'title startDate location');

    res.status(201).json({
      success: true,
      message: "User registered for event",
      registration: populatedRegistration
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get registration status for a user and event
const getRegistrationStatus = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.userId;

    const registration = await Registration.findOne({ 
      user: userId, 
      event: eventId 
    }).populate('event', 'title startDate location');

    if (!registration) {
      return res.status(200).json({ 
        registered: false,
        message: 'Not registered for this event' 
      });
    }

    res.json({
      registered: true,
      registration
    });
  } catch (error) {
    console.error('Get registration status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all registrations for an event (for organizers)
const getEventRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Check if user is the event organizer or admin
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user.userId && !['admin', 'org'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to view registrations' });
    }

    const registrations = await Registration.find({ event: eventId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      registrations,
      totalRegistrations: registrations.length
    });
  } catch (error) {
    console.error('Get event registrations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Check-in volunteer using QR code
const checkInVolunteer = async (req, res) => {
  try {
    const { qrCode } = req.body;
    
    // Parse QR code data
    let qrData;
    try {
      qrData = JSON.parse(qrCode);
    } catch (parseError) {
      return res.status(400).json({ message: 'Invalid QR code format' });
    }

    const { eventId, userId } = qrData;

    // Verify the registration exists
    const registration = await Registration.findOne({ 
      user: userId, 
      event: eventId 
    }).populate('user', 'name email')
      .populate('event', 'title startDate location');

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Check if user is organizer of the event
    const event = await Event.findById(eventId);
    if (event.organizer.toString() !== req.user.userId && !['admin', 'org'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to check-in volunteers' });
    }

    // Update registration with check-in info
    registration.status = 'checked-in';
    registration.checkedInAt = new Date();
    registration.checkedInBy = req.user.userId;
    await registration.save();

    res.json({
      success: true,
      message: 'Volunteer checked in successfully',
      registration
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ message: 'Server error during check-in' });
  }
};

// Legacy check-in (for backwards compatibility)
const checkIn = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId } = req.body;

    const registration = await Registration.findOne({ event: eventId, user: userId });
    if (!registration) return res.status(404).json({ error: "Registration not found" });

    registration.checkedInAt = new Date();
    registration.status = 'checked-in';
    registration.checkedInBy = req.user.userId;
    await registration.save();

    res.json({ success: true, message: "Check-in successful", registration });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Check-out volunteer using QR code
const checkOutVolunteer = async (req, res) => {
  try {
    const { qrCode } = req.body;
    
    // Parse QR code data
    let qrData;
    try {
      qrData = JSON.parse(qrCode);
    } catch (parseError) {
      return res.status(400).json({ message: 'Invalid QR code format' });
    }

    const { eventId, userId } = qrData;

    // Verify the registration exists
    const registration = await Registration.findOne({ 
      user: userId, 
      event: eventId 
    }).populate('user', 'name email')
      .populate('event', 'title startDate location');

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Check if volunteer is checked in
    if (registration.status !== 'checked-in') {
      return res.status(400).json({ message: 'Volunteer must be checked in first' });
    }

    // Check if user is organizer of the event
    const event = await Event.findById(eventId);
    if (event.organizer.toString() !== req.user.userId && !['admin', 'org'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to check-out volunteers' });
    }

    // Update registration with check-out info
    registration.status = 'checked-out';
    registration.checkedOutAt = new Date();
    registration.checkedOutBy = req.user.userId;
    await registration.save();

    res.json({
      success: true,
      message: 'Volunteer checked out successfully',
      registration
    });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ message: 'Server error during check-out' });
  }
};

// Legacy check-out (for backwards compatibility)
const checkOut = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId } = req.body;

    const registration = await Registration.findOne({ event: eventId, user: userId });
    if (!registration) return res.status(404).json({ error: "Registration not found" });

    registration.checkedOutAt = new Date();
    registration.status = 'checked-out';
    registration.checkedOutBy = req.user.userId;
    await registration.save();

    res.json({ success: true, message: "Check-out successful", registration });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cancel registration
const cancelRegistration = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.userId;

    const registration = await Registration.findOne({ 
      user: userId, 
      event: eventId 
    });

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Check if event has already started
    const event = await Event.findById(eventId);
    if (new Date(event.startDate) < new Date()) {
      return res.status(400).json({ message: 'Cannot cancel registration for an event that has already started' });
    }

    registration.status = 'cancelled';
    await registration.save();

    res.json({
      message: 'Registration cancelled successfully',
      registration
    });
  } catch (error) {
    console.error('Cancel registration error:', error);
    res.status(500).json({ message: 'Server error during cancellation' });
  }
};

module.exports = {
  registerForEvent,
  getRegistrationStatus,
  getEventRegistrations,
  checkInVolunteer,
  checkOutVolunteer,
  cancelRegistration,
  checkIn,
  checkOut,
};