const mongoose = require('mongoose');

const AuthorSchema = mongoose.Schema({
    name :{
        en:{type: String, required: true},
        ar:{type: String, required: true}
    },
    email: {type: String, required: true},
    biography: {
        en:{type: String, required: true},
        ar:{type: String, required: true}
    },
    profileImageUrl :{ type: String, required: true },
    birthDate: {type:Date , required: true},
},
{ timestamps: true } )
module.exports = mongoose.model('Author', AuthorSchema);
