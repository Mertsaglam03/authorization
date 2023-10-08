const express = require('express')
const router = express.Router()
const mongoose = require('mongoose');
const User = require('../models/User')
const {StatusCodes} = require('http-status-codes')
const jwt = require('jsonwebtoken')

const CustomError = require('../errors')
const {attachCookiesToResponse} = require('../utils/index')
const register = async (req,res)=>{
    const{email,name,password} = req.body
// hata var
    const emailAlreadyExists = await User.findOne({email})
    if(emailAlreadyExists){
        throw new CustomError.BadRequestError('Email Already Exists')
    }
    const isFirstAccount = await User.countDocuments({}) === 0
    const role = isFirstAccount? 'admin': 'user';
    const user = await User.create({name,email,password, role})
    const tokenUser = {name:user.name, userId:user._id, role:user.role}
    attachCookiesToResponse({res, user:tokenUser})
   
    res.status(StatusCodes.CREATED).json
    ({user: tokenUser})

}
const login = async (req,res)=>{
    const { email, password } = req.body;

    if (!email || !password) {
      throw new CustomError.BadRequestError('Please provide email and password');
    }
    const user = await User.findOne({ email });
  
    if (!user) {
      throw new CustomError.UnauthenticatedError('Invalid Credentials');
    }
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      throw new CustomError.UnauthenticatedError('Invalid Credentials');
    }
    const tokenUser = {name:user.name, userId:user._id, role:user.role}
    attachCookiesToResponse({ res, user: tokenUser });

    res.status(StatusCodes.OK).json({ user: tokenUser });
}
const logout = async (req,res)=>{
    res.cookie('token', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now() + 1000),
      });
      res.status(StatusCodes.OK).json({ msg: 'user logged out!' });
}



router.post('/register',register)
router.post('/login',login)
router.get('/logout',logout)

module.exports = router