const { Schema, model } = require('mongoose')
const { Planet } = require('./planets.model')
const axios = require('axios')

const DEFAULT_FLIGHT_NUMBER = 100
const launchesSchema = new Schema({
  flightNumber: {
    type: Number,
    required: true,
  },
  mission: {
    type: String,
    required: true,
  },
  rocket: {
    type: String,
    required: true,
  },
  launchDate: {
    type: Date,
    required: true,
  },
  target: {
    type: String,
    required: function () {
      return !this.isThirdPartyLaunch
    },
  },
  customers: [String],
  upcoming: {
    type: Boolean,
    required: true,
  },
  success: {
    type: Boolean,
    required: true,
    default: true,
  },
  isThirdPartyLaunch: {
    type: Boolean,
    required: true,
  },
})

const Launch = model('Launch', launchesSchema)

async function saveLaunch(launch) {
  if (!launch.isThirdPartyLaunch) {
    // If it is not third party launch then target should be a kepler exo planet.
    const planet = await Planet.findOne({ keplerName: launch.target })
    if (!planet) {
      throw new Error('No Matching Target Planet Found.')
    }
  }
  return await Launch.findOneAndUpdate(
    { flightNumber: launch.flightNumber },
    launch,
    {
      upsert: true,
    }
  )
}

async function getAllLaunches(skip, limit) {
  await loadSpaceXLaunches()
  const currDate = new Date()
  const launches = await Launch.find({}, { _id: 0, __v: 0 })
    .sort('flightNumber')
    .skip(skip)
    .limit(limit)

  launches.map((data) => {
    if (data.upcoming) {
      if (currDate.getFullYear() > data.launchDate.getFullYear()) {
        data.upcoming = false
        data.success = true
      } else if (currDate.getFullYear() == data.launchDate.getFullYear()) {
        if (currDate.getMonth() > data.launchDate.getMonth()) {
          data.upcoming = false
          data.success = true
        } else if (currDate.getMonth() == data.launchDate.getMonth()) {
          if (currDate.getDate() > data.launchDate.getDate()) {
            data.upcoming = false
            data.success = true
          }
        }
      }
    }
  })

  return launches
}

async function getALaunch(id) {
  const launchData = await Launch.findOne({
    flightNumber: id,
  })
  if (!launchData) {
    throw new Error(`ID:${id} is invalid`)
  } else {
    return launchData
  }
}
async function addNewLaunch(launch) {
  launch.flightNumber = (await getLatestFlightNumber()) + 1
  launch.customers = ['Utsav Chabhadiya', 'NASA']
  launch.upcoming = true
  launch.success = true
  launch.isThirdPartyLaunch = false
  await saveLaunch(launch)
}

async function abortALaunch(id) {
  const launchData = await Launch.findOne({
    flightNumber: id,
    success: true,
    upcoming: true,
  })
  if (launchData) {
    launchData.upcoming = false
    launchData.success = false
    await launchData.save()
    return true
  } else {
    throw new Error(`ID:${id} is invalid`)
  }
}

async function getLatestFlightNumber() {
  const launchData = await Launch.findOne().sort('-flightNumber')
  if (!launchData) {
    return DEFAULT_FLIGHT_NUMBER
  } else {
    return Number(launchData.flightNumber)
  }
}

async function downloadSpaceXLaunches(start) {
  const {
    data: { docs: spaceXLaunches },
  } = await axios.post(`${process.env.SPACEX_API}/launches/query`, {
    query: { flight_number: { $gt: start } },
    options: {
      pagination: false,
      select: {
        name: 1, //
        rocket: 1, //
        date_local: 1, //
        flight_number: 1, //
        upcoming: 1,
        success: 1,
        payloads: 1,
      },
      populate: [
        {
          path: 'rocket',
          select: {
            name: 1,
          },
        },
        {
          path: 'payloads',
          select: {
            customers: 1,
          },
        },
      ],
    },
  })

  if (!spaceXLaunches.length) {
    console.log('No New Launches Found in SpaceX Data')
  } else {
    const fieldsToDelete = ['name', 'date_local', 'payloads', 'flight_number']

    spaceXLaunches.map(async (launch) => {
      launch.mission = launch.name
      launch.launchDate = new Date(launch.date_local)
      launch.rocket = launch.rocket.name
      launch.flightNumber = launch.flight_number
      launch.customers = launch.payloads.flatMap((payload) => payload.customers)
      launch.isThirdPartyLaunch = true
      if (launch.success == null) {
        launch.success = true
      }
      fieldsToDelete.map((e) => delete launch[e])

      await saveLaunch(launch)
    })
    console.log(`Downloaded ${spaceXLaunches.length} Launches from SpaceX API`)
  }
}

async function loadSpaceXLaunches() {
  const latestSpaceXLaunch = await Launch.findOne(
    { isThirdPartyLaunch: true },
    { flightNumber: 1 }
  ).sort('-flightNumber')

  if (latestSpaceXLaunch) {
    downloadSpaceXLaunches(latestSpaceXLaunch.flightNumber)
  } else {
    downloadSpaceXLaunches(0)
  }
}

module.exports = {
  getAllLaunches, //
  getALaunch, //
  addNewLaunch, //
  abortALaunch, //
  loadSpaceXLaunches, //
  Launch,
}
