
const mg=require("mongoose")
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://Shailesh:ShaileshMongo@cluster0.lfsstwz.mongodb.net/BuildMyPC?retryWrites=true&w=majority";

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch(err => console.error("❌ MongoDB connection error:", err));


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