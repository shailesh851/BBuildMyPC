
const mg = require("mongoose");
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://mongo:mongo123@clusterone.ngbqtlh.mongodb.net/my_mongo_db?retryWrites=true&w=majority"

// Connect to MongoDB
mg.connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch(err => console.error("❌ MongoDB connection error:", err));


const LoginProductSchema=mg.Schema({
    Email:String,
    ProductsPlace:String,
    title:String,
    image_url:String,
    brand:String,
    type:String,
    original_price:String,
    discounted_price:String
},{
  collection:"LoginUserProducts"
})
const LoginUserProducts=mg.model("LoginUserProducts",LoginProductSchema)
module.exports=LoginUserProducts