/* eslint-env node */

import express from 'express'

const PORT = process.env.PORT || 3020
const SRC_FOLDER = 'src'

const app = express()
app.use(express.static(SRC_FOLDER))
app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`))
