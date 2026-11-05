const userModel = require("../Models/user");
const UserModel=require("../Models/user");

exports.register=async(req,res)=>{
  try{
    const {name,email,photoUrl}=req.body;
    const userExist=await userModel.findOne({email:email});

    if(!userExist){
      let newUser=new UserModel({name,email,photoUrl});
      await newUser.save()
      return res.status(200).json({
        message:"user Registered successfully",
        
        user:newUser

      })



    }
    return res.status(200).json({
      message:"Welcome Back",
      user:userExist
    })

  }catch(err){
    console.log(err);
    res.status(500).json({error:"server error",message:err.message})
    
  }
}