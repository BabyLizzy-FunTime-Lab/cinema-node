const express = require('express');
const fs = require('fs');
const app = express()
const port = 3000

app.use(express.static('public'));
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.get('/', (req, res) => res.sendFile(__dirname + "/views/index.html"));


app.listen(port, () => console.log(`HTML5 & CSS3 app listening on port ${port}!`));
