const express = require('express')
const cors = require("cors")
const morgan = require("morgan")
const dotenv = require('dotenv')
const validator = require('validator').default

const app = express()

// Load enviroment variables from .env file
dotenv.config()

/* --- Constants --- */
const PORT = process.env.PORT

// Print an error message and exit with status code 1 if the PORT environment variable is not set
if (!PORT) {
  console.error('No PORT specified')
  process.exit(1)
}

/* --- Middlewares --- */
// Log requests to the console
app.use(morgan('dev'))
// Enable CORS for all requests
app.use(cors())
// Enable parsing of JSON data
app.use(express.json())

// Global State (a fake memory database with one initial dummy data)
const users = [{
    id: 1,
    name: 'John',
    email: "john@gmail.com"
}]


/* --- Routes --- */

// Get all users
app.get('/', (_, res) => {
  // Return all users in the database
  res.send(users)
})

// Get a single user
app.get('/:id', (req, res) => {
  // Get id from params
  const id = req.params.id;

  // Get the user from the database
  const user = users.find(user => user.id === +id)

  // Return 404 if user does not exists
  if (!user) return res.status(404).send("User not found")

  // Return the user if exists
  res.send(user)
})

// Set a new user
app.post('/', (req, res) => {
  // Get user data from request body
  const user_data = req.body;

  // Check if body content is not empty
  if (!Object.keys(user_data).length) 
    return res.status(400).send("Body content is empty")

  // Return 400 if name is not valid
  if (!user_data.name || !validator.isAlpha(user_data.name)) 
    return res.status(400).send("Invalid name")

  // Return 400 if email is not valid
  if (!user_data.email || !validator.isEmail(user_data.email))
    return res.status(400).send("Invalid email")

  // Create a new user
  const newUser = {
    id: users.length + 1,
    name: user_data.name,
    email: user_data.email
  }

  // Add user to the database
  const idx = users.push(newUser)

  // Get the new user from the database
  const user = users[idx - 1]

  // Return the new user
  res.send(user)
})

// Update a user
app.put("/", (req, res) => {
  // Get user data from request body
  const user_data = req.body;

  // Check if body content is not empty
  if (!Object.keys(user_data).length) 
    return res.status(400).send("Body content is empty")

  const user = users.find(user => user.id === +user_data.id)

  // Return 404 if user does not exists
  if (!user) 
    return res.status(404).send("User not found")

  // Return 400 if name is not valid
  if (user_data.name && !validator.isAlpha(user_data.name)) 
    return res.status(400).send("Invalid name")

  // Return 400 if email is not valid
  if (user_data.email && !validator.isEmail(user_data.email))
    return res.status(400).send("Invalid email")

  // Create an updated user
  const updated_user = {
    id: user.id,
    name: user_data.name ?? user.name,
    email: user_data.email ?? user.email
  }

  // Get the index of the user in the database
  const idx = users.indexOf(user)

  // Update the user in the database
  users[idx] = updated_user

  // Return the updated user
  res.send(updated_user)
})

// Delete a user
app.delete("/:id", (req, res) => {
  const id = req.params.id;

  const idx = users.findIndex(user => user.id === +id)
  if (idx === -1) return res.status(404).send("User not found")

  // Remove the user from the database
  users.splice(idx, 1)

  res.send(`User ${id} deleted`)
})


app.set("port", PORT)

app.listen(app.get('port') ,() => {
  console.log(`Server running on port ${app.get("port")}`)
})