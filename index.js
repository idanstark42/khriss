require('dotenv').config()
const express = require('express')
const fs = require('fs')

const search = require('./search')

const PORT = process.env.PORT || 3000

const app = express()

app.use('/search', search)

app.listen(PORT, () => {
  console.log('Server is running on port', PORT)
})