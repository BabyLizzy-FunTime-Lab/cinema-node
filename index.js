const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get('/', (req, res) => res.sendFile(__dirname + "/views/index.html"));

app.post('/newbooking', function(req, res) {
    let newBooking = req.body;
    // Write new booking to data.txt
    let bookingJSON = fs.readFileSync("data/data.txt", "utf-8");
    let bookingArray = JSON.parse(bookingJSON);
    bookingArray.push(newBooking);
    bookingJSON = JSON.stringify(bookingArray);
    fs.writeFile("data/data.txt", bookingJSON, "utf-8", (err) => {
        if (err) {
            console.log("Booking data save, failed");
            res.send("Booking Failed");
        } else {
            console.log("Booking data saved id: " + newBooking.id);
            res.send("Booking successfull id: " + newBooking.id);
        }
    }); 
})

app.listen(port, () => console.log(`HTML5 & CSS3 app listening on port ${port}!`));
