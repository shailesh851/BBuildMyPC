



const exp = require("express");
const app = exp();
const cors = require("cors");
app.use(exp.json());
// Enable CORS so React (different port) can access this API
app.use(cors());
const PORT = process.env.PORT || 4000;
const Products = require("./useModels/Product.js"); // Your Mongoose model
const selectedProducts = require("./useModels/selectedProducts.js"); // Your Mongoose model
const CartProducts = require("./useModels/ShoppingCart.js"); // Your Mongoose model

app.get("/products", async (req, res) => {
  const data = await Products.find(); // Fetch all documents from MongoDB
  res.json(data);                  // Send JSON response
});

app.post("/productSelected", async (req, res) => {
  try {
    const { type } = req.body;

    // Update existing document with same type OR insert a new one
    const updatedProduct = await selectedProducts.findOneAndUpdate(
      { type: type },        // search by type
      req.body,              // new data to replace with
      { new: true, upsert: true } // return updated doc, create if not found
    );

    res.status(201).json({
      message: "✅ Product saved/updated successfully",
      product: updatedProduct
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to save product", details: error.message });
  }
});

app.get("/getSelectedproducts", async (req, res) => {
  const selectData = await selectedProducts.find(); // Fetch all documents from MongoDB
  res.json(selectData);                  // Send JSON response
});

app.delete("/removeSelectedItem", async (req, res) => {
  try {
    const { type } = req.body;

    if (!type) {
      return res.status(400).json({ error: "Type is required" });
    }

    const result = await selectedProducts.deleteOne({ type: req.body.type  });
    if (result.deletedCount > 0) {
      res.json({ message: "Product deleted successfully" });
    } else {
      res.status(404).json({ message: "No product found with this type" });
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

app.post("/addToCart",async(req,res)=>{
    if(req.body.status_msg==="ADD"){
        const docs = await selectedProducts.find();
        const docsToInsert = docs.map(doc => {
        const obj = doc.toObject();
        delete obj._id; // remove _id to avoid duplicates
        return obj;
        
    });
    await CartProducts.insertMany(docsToInsert);
    }
    else if(req.body.status_msg==="REMOVE"){
        const deletedProducts=await selectedProducts.deleteMany({})
    }

        // Refresh the page

})

app.get("/getCartproducts", async (req, res) => {
  const CartData = await CartProducts.find(); // Fetch all documents from MongoDB
  res.json(CartData);                  // Send JSON response
});

// In Express.js
app.delete("/removeCart", async (req, res) => {
  try {
    const { _id } = req.body;   // axios will send {data: {_id: "value"}}
    if (!_id) {
      return res.status(400).json({ error: "Product ID required" });
    }

    const result = await CartProducts.deleteOne({ _id: _id });

    if (result.deletedCount > 0) {
      res.status(200).json({ message: "Product removed successfully" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/addCart", async (req, res) => {
  try {
    const cartProduct = new CartProducts(req.body); // create new product
    await cartProduct.save(); // save to DB
    res.status(201).json({ message: "Product added to cart", data: cartProduct });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
