const { fetchPlanetsData } = require('./planets.model')

module.exports = {
  Query: {
    planets: async () => {
      const planets = await fetchPlanetsData()
      return planets
    },
  },
}
