import axios from 'axios'

async function httpGetPlanets() {
  try {
    const {
      data: { data },
    } = await axios.get(`${process.env.REACT_APP_SERVER}/planets`)

    return data
  } catch (err) {
    console.error(err)
    window.alert(err)
  }
}

async function httpGetLaunches() {
  try {
    const {
      data: { data },
    } = await axios.get(`${process.env.REACT_APP_SERVER}/launches`)

    data.sort((a, b) => {
      return a.flightNumber - b.flightNumber
    })
    return data
  } catch (err) {
    console.error(err)
    window.alert(err)
  }
}

async function httpSubmitLaunch(launch) {
  // TODO: Once API is ready.
  // Submit given launch data to launch system.
  try {
    const {
      data: { success },
    } = await axios.post(`${process.env.REACT_APP_SERVER}/launches`, launch)
    return success
  } catch (err) {
    throw err
  }
}

async function httpAbortLaunch(id) {
  // TODO: Once API is ready.
  // Delete launch with given ID.
  try {
    const {
      data: { success },
    } = await axios.delete(`${process.env.REACT_APP_SERVER}/launches/${id}`)
    return success
  } catch (err) {
    throw err
  }
}

export { httpGetPlanets, httpGetLaunches, httpSubmitLaunch, httpAbortLaunch }
