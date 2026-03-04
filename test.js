const express = require('express');
const app = express();
const server = app.listen(3002, () => {
    console.log("Listening on 3002");
});
server.on('error', (err) => {
    console.error("Error", err);
});
