/* eslint-env node */

const path = require('path')
const express = require('express')

const PORT = process.env.PORT || 3020
const SRC_FOLDER = path.join(__dirname, '..', 'src')

const app = express()
app.use(express.static(SRC_FOLDER))
app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`))
