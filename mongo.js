const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]

const url =
    `mongodb+srv://lkngtn:${password}@cluster0.arlgg.mongodb.net/phoneBookApp?retryWrites=true&w=majority`

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

const insert = (person) => {
  person.save().then(result => {
    console.log('Person Saved', result)
    mongoose.connection.close()
  })
}

const fetch = () => {
  Person.find({}).then(result => {
    result.forEach(person => console.log(person))
    mongoose.connection.close()
  })
}

if (process.argv[3]) {
  insert(new Person({
    name: process.argv[3],
    number: process.argv[4]
  }))
} else {
  fetch()
}

