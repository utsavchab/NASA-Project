const mongoose = require('mongoose')

async function connectToDB() {
  try {
    const response = await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to DB', response.connection.host)
    console.log('Mongodb Connection state : ', mongoose.connection.readyState)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

async function disconnectToDB() {
  try {
    await mongoose.disconnect()
    console.log('Mongodb Connection state : ', mongoose.connection.readyState)
  } catch (err) {
    console.error(err)
    // process.exit(1)
  }
}
module.exports = {
  connectToDB,
  disconnectToDB,
}
