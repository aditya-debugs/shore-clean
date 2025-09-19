// server/src/controllers/volunteerController.js
const Volunteer = require('../models/Volunteer');
const Event = require('../models/Event');

const applyVolunteer = async (req, res) => {
  try {
    const { eventId } = req.params;
    const exists = await Volunteer.findOne({ user: req.user.id, event: eventId });
    if (exists) return res.status(400).json({ message: 'Already applied' });

    const vol = await Volunteer.create({
      user: req.user.id,
      event: eventId,
      role: req.body.role,
      notes: req.body.notes
    });

    // attach to event (optionally)
    await Event.findByIdAndUpdate(eventId, { $push: { volunteers: vol._id } });

    res.status(201).json(vol);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const listVolunteersForEvent = async (req, res) => {
  try {
    const volunteers = await Volunteer.find({ event: req.params.eventId }).populate('user','name email');
    res.json(volunteers);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateVolunteerStatus = async (req, res) => {
  try {
    const vol = await Volunteer.findById(req.params.id);
    if (!vol) return res.status(404).json({ message: 'Not found' });
    // Only organizer/admin
    const event = await Event.findById(vol.event);
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Forbidden' });

    vol.status = req.body.status || vol.status;
    await vol.save();
    res.json(vol);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { applyVolunteer, listVolunteersForEvent, updateVolunteerStatus };
