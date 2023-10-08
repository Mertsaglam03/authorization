const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const validator = require('validator')
const UserSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, 'Have to provide a name value'],
        minlength:3,
        maxlength:30
    },    email:{
        type:String,
        required:[true, 'Have to provide a mail value'],
        unique:true,
        validate:{
            validator:validator.isEmail,
            message:'Please Provide valid email',
           
        }
    },    password:{
        type:String,
        required:[true, 'Have to provide a password value']
    },
    role:{
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    }
})
UserSchema.pre('save', async function(){
    if(!this.isModified('password')) return
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password,salt)
})
UserSchema.methods.comparePassword = async function(candidatePassword){
    const isMatch = await bcrypt.compare(candidatePassword, this.password)
    return isMatch

}
module.exports = mongoose.model('User', UserSchema)