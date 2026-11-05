const multer=require("multer")
const path=require("path")
const os=require("os")



//Muletr config

const storage=multer.diskStorage({
  destination:(req,file,cb)=>cb(null,os.tmpdir()),
  filename:(req,file,cb)=>cb(null,Date.now() + path.extname(file.originalname))
});

const fileFilter=(req,file,cb)=>{
  if(file.mimetype==="application/pdf")cb(null,true)

  else cb(new Error("Only PDF allowed"),false);


}


exports.upload = multer({storage,fileFilter})