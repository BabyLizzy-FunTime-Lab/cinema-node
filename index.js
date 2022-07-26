const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express()
const port = 3000

app.use(express.static('public'));
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.get('/', (req, res) => res.sendFile(__dirname + "/views/index.html"));

app.post('/newbooking', function(req, res) {
    let bookingdata = req.body;
    console.log(bookingdata.id);
    res.send("Booking successfull");
})

app.listen(port, () => console.log(`HTML5 & CSS3 app listening on port ${port}!`));
