const ResumeModel = require("../Models/resume");
const multer = require("multer");
const pdfParse = require("pdf-parse/lib/pdf-parse.js");
console.log("pdfParse export:", pdfParse);
const path = require("path");

 const fs = require("fs");
//cohere token here
const {CohereClient}=require("cohere-ai")

const cohere= new  CohereClient({
  token:process.env.COHERE_API_KEY
})



exports.addResume = async (req, res) => {
  try {
    const { job_desc, user } = req.body;

    // console.log(req.file);

    // console.log(job_desc,user);
    const pdfBuffer = req.file.buffer || null;

    const pdfPath = req.file.path;
   

    const dataBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdfParse(dataBuffer);

    // const prompt=`You are a resume screening assistant.
    // Compare the following resume text with the provided job description (JD) and give a match score(0-100) and feedback.
    
    //  Resume:
    //  ${pdfData.text}
     
    //  Job Description:
    //  ${job_desc}

    //  return the score and a brief explanation in this format:
    //  Score:XX
    //  Reason:...
     
    //  `;




    //new 


//     const prompt = `Act as an expert ATS. Compare the Resume to the Job Description (JD).

// Resume:
// ${pdfData.text}

// JD:
// ${job_desc}

// Reply EXACTLY in the format below. The Reason MUST be highly concise, maximum 40 words, and exactly 1-2 sentences to ensure it finishes completely.

// Score: XX
// Reason: ...`;

//new02



// const prompt = `Compare the following Resume and Job Description.

// Resume:
// ${pdfData.text}

// JD:
// ${job_desc}

// INSTRUCTIONS:
// 1. Provide a match score (0-100).
// 2. Provide a Reason that is strictly under 30 words.
// 3. Finish your sentence completely.

// You MUST reply exactly in this format:
// Score: 85
// Reason: The candidate matches the frontend requirements well but lacks the requested cloud deployment experience.`;

//new04

const prompt = `Evaluate the resume against the job description.

Resume:
${pdfData.text}

Job description:
${job_desc}

Instructions:
1. Provide a score from 0 to 100.
2. Write a reason based on the score:
   - Low match: state key missing qualifications.
   - Medium match: state specific areas to improve.
   - High match: state extra skills to stand out.
3. Write exactly 2 complete sentences between 40 and 50 words total so the text finishes before the cutoff.

Format:
Score: XX
Reason: ...`;



     const response = await cohere.chat({
      model: "command-r-08-2024", // updated active model
      message: prompt,
      maxTokens: 100,
      temperature: 0.7,
    });

     let result = response.text;
    //  console.log(result)
    
    //Score
    const match = result.match(/Score:\s*(\d+)/)
    const score=match ? parseInt(match[1],10):null;

    //feedback

    const reasonMatch=result.match(/Reason:\s*([\s\S]*)/)
    const reason= reasonMatch ? reasonMatch[1].trim(): null;




   const newResume=new ResumeModel({
    user,
    resume_name:req.file.originalname,
    job_desc,
    score,
    feedback: reason

   })
   
   await newResume.save();
   fs.unlinkSync(pdfPath)// remove temp file

   res.status(200).json({message:"your analysis are ready",data:newResume})





  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "server error", message: err.message });
  }
};



exports.getAllResumesForUser= async (req,res)=>{

  try{
    const {user}=req.params;
    let resumes=await ResumeModel.find({user:user}).sort({createdAt:-1})
    return res.status(200).json({message:"Your previous history",resumes:resumes})

  }catch(err){
    console.log(err);
    res.status(500).json({ error: "server error", message: err.message });

  }
}


exports.getAllResumesForAdmin = async (req,res)=>{

  try{
     let resumes=await ResumeModel.find({}).sort({createdAt:-1}).populate("user")
    return res.status(200).json({message:"fetch all History",resumes:resumes})


  }catch(err){
    console.log(err);
    res.status(500).json({ error: "server error", message: err.message });

  }
}