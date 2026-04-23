import { check } from 'express-validator'

const cors = require('cors')({ origin: true })
const express = require('express')
const app = express()

app.use(cors)
app.use(express.json())

const router = require('express-promise-router')()

router.post(
  '/health',
  [check('message').exists()],
  require('./api/health/test').handle,
)

router.get(
  '/pesticides/search',
  require('./api/pesticides/search').handle,
)

router.get(
  '/pesticides/:registrationNumber',
  require('./api/pesticides/detail').handle,
)

app.use(router)

export default app
