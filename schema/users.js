import mongoose from 'mongoose';

const user = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    username:String,
    password:String,
    imageUrl:String,
    breed: String,
    signature:String
    
})

export default mongoose.model('User',user);