const mongodb = require('../db/mongodb')
const ObjectId = require('mongodb').ObjectId

const init = async () => {
  const db = await mongodb()
  return await db.collection('image')
}

module.exports = {
  async findOne (data) {
    const db = await init()
    return db.findOne(data, {})
  },
  async insertOne (data) {
    const db = await init()
    return db.insertOne(data)
  },
  async find (data) {
    const db = await init()
    return db.find(data).toArray()
  },
  async updateOne (data, id) {
    const db = await init()
    return db.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: data
      }
    )
  },
  async deleteOne (id) {
    const db = await init()
    return db.deleteOne({ _id: new ObjectId(id) })
  }
}
