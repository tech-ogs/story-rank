const { Client } = require('pg')

function getClient() {
  const client = new Client({
    user: 'postgres',
    database: 'stories'
  })
  client.connect()
  return client
}

exports = module.exports = {
  getClient
}
