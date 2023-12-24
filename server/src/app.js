const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const path = require('path')
const helmet = require('helmet')

const planetsRouter = require('./routes/planets/planets.router')
const launchesRouter = require('./routes/launches/launches.router')
const v1ApiRouter = require('./routes/api/v1.api')

const app = express()

app.use(
  cors({
    origin: 'http://localhost:3000',
  })
)
app.use(helmet())

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(morgan('dev'))
app.use(express.static(path.join(__dirname, '..', 'public')))

app.use('/api/v1', v1ApiRouter)

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'))
})

module.exports = app
