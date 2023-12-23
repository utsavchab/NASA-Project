const express = require('express')
const launchesRouter = require('../launches/launches.router')
const planetsRouter = require('../planets/planets.router')

const v1ApiRouter = express.Router()

v1ApiRouter.use('/planets', planetsRouter)
v1ApiRouter.use('/launches', launchesRouter)

module.exports = v1ApiRouter
