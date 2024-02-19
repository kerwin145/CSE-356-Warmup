const express = require('express')
const bodyParser = require('body-parser')
require('dotenv').config();

const app = express()
const port = 80
const ipAddress = '0.0.0.0'
const path = require('path')

const connect4Routes = require('./connect_four.js')

//middleware
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
//our routes
app.use('/connect.php', connect4Routes)


app.listen(port, ipAddress, () => {
    console.log(`Connect-4 app listening at http://localhost:${port}`)
});
