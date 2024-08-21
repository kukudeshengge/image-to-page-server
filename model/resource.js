const mongodb = require('../db/mongodb')

const init = async () => {
  const db = await mongodb()
  return await db.collection('resource')
}

module.exports = {
  async find (data) {
    const db = await init()
    return db.find(data).toArray()
  },
  async insertOne(data) {
    const db = await init()
    return db.insertOne(data)
  }
}
