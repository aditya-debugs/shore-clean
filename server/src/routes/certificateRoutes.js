// server/src/routes/certificateRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { issueCertificate, listCertificates } = require('../controllers/certificateController');

router.post('/issue', protect, issueCertificate); // org/admin issues
router.get('/', protect, listCertificates);
module.exports = router;
