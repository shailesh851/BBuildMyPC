
const mg=require("mongoose")
mg.connect("mongodb://127.0.0.1:27017/my_mongo_db").then(()=>
  console.log("connected")).catch((error)=>console.log(error))

const CartSchema=mg.Schema({
    title:String,
    image_url:String,
    brand:String,
    type:String,
    original_price:String,
    discounted_price:String
},{
  collection:"ShoppingCart",
})
const CartOperation=mg.model("CartOperation",CartSchema)
module.exports=CartOperation