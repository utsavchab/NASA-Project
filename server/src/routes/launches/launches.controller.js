const {
  getAllLaunches,
  getALaunch,
  addNewLaunch,
  abortALaunch,
} = require('../../models/launches/launches.model')
const { getPagination } = require('../../utils/query')

async function httpGetAllLaunches(req, res) {
  const { skip, limit } = getPagination(req.query)

  const launches = await getAllLaunches(skip, limit)
  console.log(launches)
  return res.status(200).json({
    success: true,
    data: launches,
  })
}

async function httpGetALaunchByID(req, res) {
  try {
    const id = req.params.id
    const launch = await getALaunch(id)
    return res.status(200).json({
      success: true,
      data: launch,
    })
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    })
  }
}
async function httpAddNewLaunch(req, res) {
  try {
    const launch = req.body

    launch.mission = launch.mission?.trim()
    launch.target = launch.target?.trim()

    launch.rocket = launch.rocket?.trim()
    launch.launchDate = new Date(launch.launchDate)
    if (isNaN(launch.launchDate)) {
      return res.status(400).send({
        success: false,
        message: 'Invalid Launch Date.',
      })
    }
    if (
      isNaN(launch.launchDate) ||
      !launch.mission ||
      !launch.target ||
      !launch.rocket
    ) {
      return res.status(400).send({
        success: false,
        message: 'All Fields are required.',
      })
    } else {
      await addNewLaunch(launch)
      return res.status(201).json({
        success: true,
        data: launch,
      })
    }
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    })
  }
}

async function httpAbortALaunch(req, res) {
  try {
    if (!/^[0-9]*$/.test(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: `ID:${req.params.id} is invalid`,
      })
    }
    const id = Number(req.params.id)

    await abortALaunch(id)
    return res.status(200).json({
      success: true,
      data: id,
      message: `Flight Number ${id}, is aborted.`,
    })
  } catch (err) {
    return res.status(404).json({
      success: false,

      message: err.message,
    })
  }
}

module.exports = {
  httpGetAllLaunches,
  httpGetALaunchByID,
  httpAddNewLaunch,
  httpAbortALaunch,
}
