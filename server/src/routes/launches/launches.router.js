const express = require('express')
const {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortALaunch,
  httpGetALaunchByID,
} = require('./launches.controller')

const launchesRouter = express.Router()

launchesRouter.get('/', httpGetAllLaunches)
launchesRouter.get('/:id', httpGetALaunchByID)
launchesRouter.post('/', httpAddNewLaunch)
launchesRouter.delete('/:id', httpAbortALaunch)

module.exports = launchesRouter
