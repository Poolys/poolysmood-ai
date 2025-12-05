
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 3000;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(bodyParser.json());
app.use((req,res,next)=>{
  res.header("Access-Control-Allow-Origin","*");
  res.header("Access-Control-Allow-Headers","Content-Type");
  next();
});

app.post('/ask-ai', async (req,res)=>{
  try{
    const message = req.body.message || "Ciao!";
    const aiResponse = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{role:"user", content: message}]
    });
    const reply = aiResponse.choices[0].message.content;
    res.json({ reply });
  } catch(err){
    console.error(err);
    res.status(500).json({error:"AI error"});
  }
});

app.post('/send-email', async (req,res)=>{
  try{
    const transporter = nodemailer.createTransport({
      service: "Outlook",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      subject: "Nuovo contatto da Pooly's Mood",
      text: JSON.stringify(req.body,null,2)
    });

    res.json({status:"ok"});
  } catch(err){
    console.error(err);
    res.status(500).json({error:"Email error"});
  }
});

app.listen(PORT,()=>console.log("Server avviato su porta",PORT));
