const { getAllLaunches } = require('./launches.model')
module.exports = {
  Query: {
    launches: async () => {
      const launches = await getAllLaunches()

      return launches
    },
  },
}
