import express from 'express';
import mongoose from 'mongoose';
import User from './schema/users.js';
import jwt from 'jsonwebtoken';
import bcrypt, { hash } from 'bcrypt';

//app config
const app = express();
const PORT = process.env.PORT || 8001;
const connectionURL  ="mongodb+srv://pawedu:JIxVei9vi3cn2aXK@cluster0.9qsug.mongodb.net/paweddb?retryWrites=true&w=majority";


//middleware
app.use(express.json())

// DB config
mongoose.connect(connectionURL,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true
})


//api endpoints
app.get('/',(req,res)=>{
    res.status(200).send("Welcome to PawedU")
});


app.post('/api/login', (req,res)=>{
    User.find({username:req.body.name})
    .exec()
    .then(user=>{
        if(user.length<1){
            return res.status(401).json({
                message : "No User Exist with this name"
            })
        }else{
            bcrypt.compare(req.body.password,user[0].password,(err,result)=>{
                if(err){
                    return res.status(401).json({
                        message:'Auth Failed'
                    })
                }
                if(result){
                   const token = jwt.sign({
                        name:user[0].username,
                        userID:user[0]._id
                    },"SecretJWTKey")
                    return res.status(200).json({
                        message:'Login Succesful',
                        token:token,
                        signature:user[0].signature
                    })
                }
               res.status(401).json({
                        message:'Auth Failed'
                    })
                
            })
        }
    })
    .catch();
})


app.post('/api/register',(req,res)=>{

    User.find({username:req.body.name})
    .exec()
    .then(user =>{
        if(user.length>0){
            return res.status(409).json({
                message : "Username already exists"
            })
        }else{

            bcrypt.hash(req.body.password,10,(err ,hash)=>{
                if(err){
                    return res.status(500).json({
                        error:err
                    })
                }else{
                    const userDeatils = new User({
                        _id:new mongoose.Types.ObjectId(),
                        username:req.body.name,
                        password:hash,
                        imageUrl:req.body.imageUrl,
                        breed: req.body.breed,
                        signature:req.body.signature
                
                    });
                    userDeatils.save().then(result =>{
                        res.status(201).json({
                            message:"Registred Succesfully"
                        })
                    })
                    .catch(err =>{
                        res.status(500).json({
                            message:err
                        })
                    })
                }
            })
        
        }

    })
    .catch()

   
    
});



app.get('/api/getUsers', verifyToken, (req,res)=>{

    jwt.verify(req.token, 'SecretJWTKey' ,(err,authData)=>{
        if(err){
            res.sendStatus(403)
        }else{
            User.find((err , users)=>{
                if(err){
                    res.status(500).send(err)
                }else{
                 res.status(200).send(users);
                    
                }
             })
        }
    });
    

})


function verifyToken(req ,res ,next){
    const bearerHeader = req.headers['authorization'];
    if(typeof bearerHeader !== 'undefined'){
        const token = bearerHeader.split(' ')
        req.token = token[1];
        next();
    }else{
        res.sendStatus(403);
    }



}

//listner
app.listen(PORT,()=>console.log(`listning on local host ${PORT}`))