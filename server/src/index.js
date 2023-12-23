const app = require('./app')
const https = require('https')
const fs = require('fs')
const { connectToDB } = require('./config/database.config')
const { loadSpaceXLaunches } = require('./models/launches.model')
const { loadPlanetsData } = require('./models/planets.model')
require('dotenv').config()

https
  .createServer(
    {
      key: fs.readFileSync('key.pem'),
      cert: fs.readFileSync('cert.pem'),
    },
    app
  )
  .listen(process.env.PORT || 8000, async () => {
    await connectToDB()
    await loadPlanetsData()
    await loadSpaceXLaunches()
    console.log('Server live at ', process.env.PORT)
  })
