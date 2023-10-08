const CustomError = require('../errors')
const checkPermissions = (requestUser, resourseId)=>{
    if(requestUser.role === 'admin'){
        return
    }
    if(requestUser.userId=== resourseId.toString()){
        return
    }
    throw new CustomError.UnauthenticatedError('Unathorized to make this activity')

}
module.exports = checkPermissions