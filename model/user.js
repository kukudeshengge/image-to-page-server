const mongodb = require('../db/mongodb')
const ObjectId = require('mongodb').ObjectId

const init = async () => {
  const db = await mongodb()
  return await db.collection('user')
}

module.exports = {
  async findOne (data) {
    const db = await init()
    if (data._id) {
      data._id = new ObjectId(data._id)
    }
    return db.findOne(data, {})
  },
  async insertOne (data) {
    const db = await init()
    return db.insertOne(data)
  }
}
