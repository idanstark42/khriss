const { MongoClient } = require('mongodb')

exports.collection = async function (name) {
  const client = new MongoClient(process.env.MONGODB_URI)
  await client.connect()
  const db = client.db(process.env.MONGODB_DB)
  return db.collection(name)
}