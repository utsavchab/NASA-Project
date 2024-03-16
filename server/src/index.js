const app = require('./app')
const https = require('https')
const fs = require('fs')

const { connectToDB } = require('./config/database.config')
const { loadSpaceXLaunches } = require('./models/launches/launches.model')
const { loadPlanetsData } = require('./models/planets/planets.model')
require('dotenv').config()
const { loadFilesSync } = require('@graphql-tools/load-files')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const { ApolloServer } = require('apollo-server-express')
const schema = makeExecutableSchema({
  typeDefs: loadFilesSync('**/*', {
    extensions: ['graphql'],
  }),
  resolvers: loadFilesSync('**/*', {
    extensions: ['.resolvers.js'],
  }),
})
const server = new ApolloServer({
  schema: schema,
})
app.listen(process.env.PORT, async () => {
  await connectToDB()
  await loadPlanetsData()
  await loadSpaceXLaunches()
  await server.start()
  server.applyMiddleware({ app, path: '/api/v1/graphql' })
  console.log('Server live at ', process.env.PORT)
})

// https
//   .createServer(
//     {
//       key: fs.readFileSync('key.pem'),
//       cert: fs.readFileSync('cert.pem'),
//     },
//     app
//   )
//   .listen(process.env.PORT || 8000, async () => {
//     await connectToDB()
//     await loadPlanetsData()
//     await loadSpaceXLaunches()
//     console.log('Server live at ', process.env.PORT)
//   })
