const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const path = require('path')
const helmet = require('helmet')

const { makeExecutableSchema } = require('@graphql-tools/schema')
const { loadFilesSync } = require('@graphql-tools/load-files')
const { ApolloServer } = require('apollo-server-express')

const v1ApiRouter = require('./routes/api/v1.api')

// const typesArray = loadFilesSync('**/*', {
//   extensions: ['graphql'],
// })
// const resolversArray = loadFilesSync('**/*', {
//   extensions: ['.resolvers.js'],
// })

const app = express()

app.use(
  cors({
    origin: ['http://localhost:3000', 'https://studio.apollographql.com'],
  })
)
// app.use(
//   helmet({
//     contentSecurityPolicy:
//       process.env.NODE_ENV === 'production' ? undefined : false,
//   })
// )

// async function startApolloServer() {
//   const schema = makeExecutableSchema({
//     typeDefs: typesArray,
//     resolvers: resolversArray,
//   })

//   const server = new ApolloServer({
//     schema,
//     playground: true,
//   })

//   await server.start()

//   server.applyMiddleware({ app, path: '/api/v1/graphql' })
// }

// startApolloServer()

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(morgan('dev'))
app.use(express.static(path.join(__dirname, '..', 'public')))

app.use('/api/v1', v1ApiRouter)

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'))
})

module.exports = app
