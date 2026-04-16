// A mock service replacing external queueing systems like BullMQ or RabbitMQ to avoid heavy infrastructure for tests.

/**
 * Simulates pushing an email task to a queue
 * @param {String} email 
 * @param {String} subject 
 * @param {String} body 
 */
exports.queueEmail = async (email, subject, body) => {
    console.log(`[QUEUE] Pushing email to queue for ${email}...`);
    
    // Simulate async processing (e.g. queue worker picking it up later)
    setTimeout(() => {
        console.log(`[EMAIL SENT] Subject: ${subject} | To: ${email} | Status: Success`);
    }, 2000);
};
