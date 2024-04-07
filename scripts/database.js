require("dotenv").config()
const pg = require("pg")
const { Client } = pg
const fs = require("fs")

let client;

if (process.env.DB_HOST.includes("localhost")) {
  console.log("localhost")
  client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  })
} else {
  console.log("production database")

  client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: true,
    ssl: {
        rejectUnauthorized: false,
        ca: fs.readFileSync('./global-bundle.pem').toString(), 
      },
  })
  
}

client.connect((err, db) => {
  if (err) throw err
})
 
module.exports ={
  client
}