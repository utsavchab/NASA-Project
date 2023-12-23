const { fetchPlanetsData } = require('../../models/planets.model')

async function getAllPlanets(req, res) {
  const planets = await fetchPlanetsData()

  return res.status(200).send({
    success: true,
    data: planets,
  })
}

module.exports = {
  getAllPlanets,
}
