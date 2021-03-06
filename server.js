import express from 'express';
import mongoose from 'mongoose';
import User from './schema/users.js';
import jwt from 'jsonwebtoken';
import bcrypt, { hash } from 'bcrypt';
import cors from "cors";

//app config
const app = express();
const PORT = process.env.PORT || 8001;
const connectionURL  ="mongodb+srv://pawedu:JIxVei9vi3cn2aXK@cluster0.9qsug.mongodb.net/paweddb?retryWrites=true&w=majority";


//middleware
app.use(express.json())
app.use(cors())

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
    User.find({username:req.body.username})
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
                        id:user[0]._id,
                        status:true,
                        token:token,
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

    User.find({username:req.body.username})
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
                        username:req.body.username,
                        name:req.body.name,
                        password:hash,
                        imageUrl:req.body.imageUrl,
                        breed: req.body.breed,
                
                    });
                    userDeatils.save().then(result =>{
                        res.status(201).json({
                            status:true,
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


app.get('/api/getUsers/:id',verifyToken,(req,res)=>{
    jwt.verify(req.token,'SecretJWTKey',(err,authData)=>{
        if(err){
            res.sendStatus(403);
        }else{
            User
            .findById(req.params.id)
            .then(doc =>{
                if(!doc){return res.sendStatus(404);}
                else{
                    res.status(200).send(doc);
                }
            })
            
        }
    })
})


app.put('/api/user/:id', verifyToken, (req,res)=>{
    jwt.verify(req.token,'SecretJWTKey',(err,authData)=>{
        if(err){
            res.sendStatus(404);
        }else{
            const options = { returnNewDocument: true };
            User.findOneAndUpdate({_id:req.params.id}, req.body,options)
            .then(user=>{
                if(!user){
                    return res.sendStatus(403);
                }else{
                    return res.status(200).send({
                        message :"User Updated Succesfully!"
                    });
                }
            })
            .catch(err => {
                return res.status(403).send(err);
            })
        }
    })
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