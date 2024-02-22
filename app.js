const express = require('express')
require('dotenv').config();

const multer = require('multer');
const upload = multer({ dest: 'uploads/' })

const app = express()
const port = 80
const ipAddress = '0.0.0.0'
const path = require('path')

const connect4Routes = require('./connect_four.js')
const tttRoutes = require('./ttt.js')
const battleShipRoutes = require('./battleship.js')
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

//middleware
app.use(express.static(path.join(__dirname, 'public')))
app.use(upload.single('file')) //parses multipart data
app.use(function(req, res, next) {
    // console.log(req.headers)
    // console.log(req.params)
    console.log(req.query)
    console.log(req.body)
   
    res.setHeader("X-CSE356", process.env.HEADER)
    next()
});


//our routes
app.use('/connect.php', connect4Routes)
app.use('/ttt.php', tttRoutes)
app.use('/battleship.php', battleShipRoutes)

app.listen(port, ipAddress, () => {
    console.log(`Connect-4 app listening at http://localhost:${port}`)
});
