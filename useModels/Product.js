
const mg = require("mongoose");
MONGO_URI="mongodb+srv://Shailesh:ShaileshMongo@cluster0.lfsstwz.mongodb.net/"
const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/my_mongo_db";

mg.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch(err => console.error("❌ MongoDB connection error:", err));


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