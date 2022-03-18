require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

app.use(cors())
app.use(express.static('build'))
app.use(express.json())

morgan.token('body', req => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/info', (request, response) => {
    Person.estimatedDocumentCount().then(count => {
        response.writeHead(200, {'Content-Type': 'text/html'})
        response.end(`
            <p>Phonebook has info for ${count} people</p>
            <p>${new Date()}</p>
        `)
    })
})
 
app.get('/api/persons', (request, response) => {
    Person.find({}).then(foundEntry => {
        response.json(foundEntry)
    })
})

app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id)
        .then(foundEntry => {
            if (foundEntry) {
                response.json(foundEntry)
            } else {
                response.status(404).end()
            }
        })
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id).then(deletedEntry => {
        response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response) => {
    const body = request.body
    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'provide both name and number for new person'
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person.save().then(savedEntry => {
        return response.json(savedEntry)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response) => {
    const body = request.body
    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'provide both name and number for this person'
        })
    }
    Person.findByIdAndUpdate(request.params.id, {number: body.number}, {new: true}).then(updatedEntry => {
        response.json(updatedEntry)
    })
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({error: 'unknown endpoint'})
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({error: 'malformatted id'})
    }
    next(error)
}

// this has to be the last loaded middleware
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`);