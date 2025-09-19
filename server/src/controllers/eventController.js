// server/src/controllers/eventController.js
const Event = require('../models/Event');
const Volunteer = require('../models/Volunteer');

const createEvent = async (req, res) => {
  try {
    const data = req.body;
    data.organizer = req.user.id;
    const event = await Event.create(data);
    res.status(201).json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Forbidden' });

    Object.assign(event, req.body);
    await event.save();
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer','name email');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const listEvents = async (req, res) => {
  try {
    // basic pagination & filtering
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page-1)*limit;
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.organizer) filter.organizer = req.query.organizer;

    const events = await Event.find(filter).sort({ startDate: 1 }).skip(skip).limit(limit);
    res.json({ page, limit, events });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// RSVP / register
const rsvpEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.attendees.includes(req.user.id)) return res.status(400).json({ message: 'Already RSVP\'d' });

    if (event.capacity && event.attendees.length >= event.capacity) return res.status(400).json({ message: 'Event full' });

    event.attendees.push(req.user.id);
    await event.save();
    res.json({ message: 'RSVP successful', event });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Cancel RSVP
const cancelRsvp = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    event.attendees = event.attendees.filter(a => a.toString() !== req.user.id);
    await event.save();
    res.json({ message: 'RSVP cancelled' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete Event
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Optional: Check if user is the event creator (organizer)
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to delete this event' });
    }

    await event.deleteOne();
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createEvent, updateEvent, getEvent, listEvents, rsvpEvent, cancelRsvp, deleteEvent };
