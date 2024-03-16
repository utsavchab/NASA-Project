const { parse } = require('csv-parse')
const fs = require('fs')

const { Schema, model } = require('mongoose')

const planetsSchema = new Schema({
  keplerName: {
    type: String,
    required: true,
    unique: true,
  },
})

const Planet = model('Planet', planetsSchema)

async function loadPlanetsData() {
  const isHabitable = (planet) => {
    return (
      planet['koi_disposition'] === 'CONFIRMED' &&
      planet['koi_insol'] > 0.36 &&
      planet['koi_insol'] < 1.11 &&
      planet['koi_prad'] < 1.6
    )
  }
  await new Promise((resolve, reject) => {
    fs.createReadStream('./src/models/planets/kepler_data.csv') // returns an event emitter
      .pipe(
        parse({
          comment: '#',
          columns: true,
          skipEmptyLines: true,
          delimiter: ',', // for csv
        })
      )
      .on('data', async (planet) => {
        if (isHabitable(planet)) {
          savePlanet(planet)
        }
      })
      .on('error', (err) => {
        console.error(err)
        reject()
      })
      .on('end', () => {
        resolve()
      })
  })
}

async function fetchPlanetsData() {
  try {
    const data = await Planet.find({})

    return data
  } catch (err) {
    console.error(err)
  }
}

async function savePlanet(planet) {
  try {
    await Planet.updateOne(
      { keplerName: planet.kepler_name },
      { keplerName: planet.kepler_name },
      { upsert: true }
    )
  } catch (err) {
    console.error(`Could not save planet ${err}`)
  }
}

module.exports = {
  Planet,
  loadPlanetsData,
  fetchPlanetsData,
}
