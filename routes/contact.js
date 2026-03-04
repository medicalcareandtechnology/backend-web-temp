const express = require('express');
const Contact = require('../models/Contact');
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { name, email, subject, message, ...otherData } = req.body;

        // Save the submission to MongoDB
        const newContact = new Contact({
            name: name || otherData.firstName,
            email,
            subject,
            message: message || JSON.stringify(otherData)
        });
        await newContact.save();

        console.log('Saved contact form submission to database');
        res.status(200).json({ success: true, message: 'Message received and saved successfully.' });
    } catch (error) {
        console.error('Contact error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
