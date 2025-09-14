
const mg = require("mongoose");
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://mongo:mongo123@clusterone.ngbqtlh.mongodb.net/my_mongo_db?retryWrites=true&w=majority"

// Connect to MongoDB
mg.connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch(err => console.error("❌ MongoDB connection error:", err));


const userSchema=mg.Schema({
    UserName:String,
    Email:String,
    Password:String,
    City:String,
    State:String,
    Pincode:String,
    Phone:String,
    ProfileImage:String,
    ImageURL:String
    
},{
  collection:"SignUp"
})
const SignUp=mg.model("SignUp",userSchema)
module.exports=SignUp