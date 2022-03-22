const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

console.log('connecting to', url);

mongoose.connect(url)
    .then(result => {
        console.log('connected to MongoDB')
    })
    .catch(error => {
        console.log('error connecting to MongoDB:', error.message)
    })

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 3, 
        required: true
    },
    number: {
        type: String,
        validate: {
            validator: input => {
                // validation for US based phone numbers
                return /^(\()?\d{3}(\))?(-|\s)?\d{3}(-|\s)\d{4}$/.test(input)
            },
            message: input => `${input.value} is not a valid phone number!`
        },
        required: [true, 'User phone number required'] 
    }
})

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Person', personSchema)
