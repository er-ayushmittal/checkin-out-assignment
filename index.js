const express=require('express');
const app=express();
const mongoose=require('mongoose');
const path=require('path');
const Data=require('./models/dat');
const methodOverride=require('method-override');
const { response } = require('express');
require('dotenv').config();


mongoose.connect(process.env.WEBDAT)
.then(()=>{
    console.log("DB CONNECTED")
})
.catch((err)=>{
    console.log(err)
})
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'/views'));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')))

app.get("/",(req,res)=>{
    res.redirect('/home');
})

app.get('/home',async (req,res)=>{
    const data=await Data.find({});
    res.render('home',{data});
})
app.get('/home/enter',(req,res)=>{
    res.render('enter');
})
app.post('/home',async(req,res)=>{

    var d=new Date();
    var time=d.toLocaleTimeString().toUpperCase();
    var date=d.toLocaleDateString('pt-PT');

    const {name,email,phone}=req.body;
    sendemail(email,name);
    await Data.create({name,email,phone,time,date});
    res.redirect('/home');
})
app.get('/home/:id',async(req,res)=>{
    const {id}=req.params;
    const d=await Data.findById(id);
    res.render('exit',{d});
})
app.put('/home/:id',async(req,res)=>{

    var dd=new Date();
    var time=dd.toLocaleTimeString().toUpperCase();
    var date=dd.toLocaleDateString('pt-PT');


    const {id}=req.params;

    const d=await Data.findById(id)
    sendexmail(d.email,time,date)
    await Data.findByIdAndUpdate(id,{$set:{status:"Checked Out", couth:time , coutm:date}});
    res.redirect('/home');

})
app.delete('/home/:id',async (req,res)=>{
    const {id}=req.params;
    await Data.findByIdAndDelete(id);
    res.redirect('/home');
})

const days=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]

function sendemail(email,name){
    const sgMail=require('@sendgrid/mail');
    const  sendgrid=process.env.API;
  sgMail.setApiKey(sendgrid);

  var d=new Date();
  var time=d.toLocaleTimeString().toUpperCase();
  var date=d.toLocaleDateString('pt-PT');
  var day=d.getDay();
  const msg={
      to: email,
      from: process.env.FMAIL,
      subject:"Entering building",
      text:`Hi ${name} you entered the building at ${time} on ${days[day]} (${date})`
  };
  sgMail.send(msg)
  .then(response=> console.log('email send ...'))
  .catch((err)=>console.log(err.message)+"error");
}


function sendexmail(email,name){
    const sgMail=require('@sendgrid/mail');
    const  sendgrid=process.env.API;
  sgMail.setApiKey(sendgrid);
  
  var d=new Date();
  var time=d.toLocaleTimeString().toUpperCase();
  var date=d.toLocaleDateString('pt-PT');
  var day=d.getDay();

  const msg={
      to: email,
      from: process.env.FMAIL,
      subject:"Checking out",
      text:`Hi ${name} you Check-Out the building at ${time} on ${days[day]} (${date})`
  };
  sgMail.send(msg)
  .then(response=> console.log('email send ...'))
  .catch((err)=>console.log(err.message)+"error");
}

app.listen(3000,(req,res)=>{
    console.log("UP AT 3000");
})