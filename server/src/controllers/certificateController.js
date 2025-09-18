// server/src/controllers/certificateController.js
const Certificate = require('../models/Certificate');
// utils that actually generate files (placeholder)
const { generateCertificate } = require('../utils/certificateGen');

const issueCertificate = async (req, res) => {
  try {
    const { eventId, userId } = req.body;
    // generate certificate (PDF/SVG) and return URL
    const certUrl = await generateCertificate({ eventId, userId });

    const cert = await Certificate.create({
      event: eventId,
      user: userId,
      certUrl,
      metadata: req.body.metadata || {}
    });

    res.status(201).json(cert);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const listCertificates = async (req, res) => {
  try {
    const q = {};
    if (req.query.user) q.user = req.query.user;
    if (req.query.event) q.event = req.query.event;
    const list = await Certificate.find(q).populate('event','title').populate('user','name email');
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { issueCertificate, listCertificates };
