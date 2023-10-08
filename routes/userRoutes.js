const express = require('express')
const router = express.Router()
const{authenticateUser, authorizePermissions} = require('../middleware/authentication')
const User = require('../models/User')
const {StatusCodes} = require('http-status-codes')
const CustomError = require('../errors')
const { attachCookiesToResponse,checkPermissions } = require('../utils')

const getAllUsers = async (req,res)=>{
    const users = await User.find({role:'user'}).select('-password')

    res.status(StatusCodes.OK).json({users})
}
const getSingleUser = async (req,res)=>{
    const {user} = await User.findOne({_id:req.params.id}).select('-password')
    if(!user){
        throw new CustomError.NotFoundError('No user with id')
    }
    checkPermissions(req.user, user._id)
    res.status(StatusCodes.OK).json({user})
}
const showCurrentUser = async (req,res)=>{
    res.status(StatusCodes.OK).json({user:req.user})
}
const updateUser = async (req,res)=>{
    const { email, name } = req.body;
    if (!email || !name) {
      throw new CustomError.BadRequestError('Please provide all values');
    }
    const user = await User.findOne({ _id: req.user.userId });
  
    user.email = email;
    user.name = name;
  
    await user.save();
    const tokenUser = { name: user.name, userId: user._id, role: user.role }
    attachCookiesToResponse({res,user:tokenUser})
    res.status(StatusCodes.OK).json({user:tokenUser})




}
const updateUserPassword = async (req,res)=>{
    const{oldPassword, newPassword} = req.body
    if(!oldPassword || !newPassword){
        throw new CustomError.BadRequestError('Please provide both values')
    }
    const user = await User.findOne({_id:req.user.userId})
    const isPasswordCorrect = await user.comparePassword(oldPassword)
    if(!isPasswordCorrect){
        throw new CustomError.UnauthenticatedError('Incorrect Password')
    }
    user.password = newPassword;
    await user.save();
    res.status(StatusCodes.OK).json({msg:'Successfully changed the password'})
}
module.exports = {getAllUsers, getSingleUser, showCurrentUser, updateUser, updateUserPassword }


router.route('/').get(authenticateUser,authorizePermissions('admin', 'owner'),getAllUsers);
router.route('/showMe').get(authenticateUser,showCurrentUser)
router.route('/updateUser').patch(authenticateUser,updateUser)
router.route('/updateUserPassword').patch(updateUserPassword)
router.route('/:id').get(authenticateUser,getSingleUser)


module.exports = router