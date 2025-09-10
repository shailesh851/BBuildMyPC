
const mg = require("mongoose");
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://Shailesh:ShaileshMongo@cluster0.lfsstwz.mongodb.net/BuildMyPC?retryWrites=true&w=majority";

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
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