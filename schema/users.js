import mongoose from 'mongoose';

const user = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    username:String,
    name:String,
    password:String,
    imageUrl:String,
    breed: String,
    
})

export default mongoose.model('User',user);