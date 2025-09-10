
const mg=require("mongoose")
mg.connect("mongodb://127.0.0.1:27017/my_mongo_db").then(()=>
  console.log("connected")).catch((error)=>console.log(error))

const userSchema=mg.Schema({
    title:String,
    image_url:String,
    brand:String,
    type:String,
    original_price:String,
    discounted_price:String
},{
  collection:"BuildMyPC"
})
const userModel=mg.model("userModel",userSchema)
module.exports=userModel