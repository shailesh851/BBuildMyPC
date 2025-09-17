


const axios = require("axios");
const exp = require("express");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const app = exp();
const cors = require("cors");
app.use(exp.json());
app.use(cookieParser());

const dotenv =require("dotenv");
dotenv.config();

const allowedOrigins = [
  "http://localhost:3000",
  "https://bbuildmypc.onrender.com",   // local React
  "https://fbuildmypc.onrender.com"  // live deployed React
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);


const PORT = process.env.PORT || 4000;
const Product = require("./useModels/Product.js"); // Your Mongoose model
const selectedProducts = require("./useModels/selectedProducts.js"); // Your Mongoose model
const CartProduct = require("./useModels/ShoppingCart.js"); // Your Mongoose model
const SignUp = require("./useModels/SignUp.js"); // Your Mongoose model
const Login = require("./useModels/Login.js"); // Your Mongoose model
const LoginUserProducts = require("./useModels/LoginUserProducts.js"); // Your Mongoose model

app.get("/products", async (req, res) => {
  const data = await Product.find(); // Fetch all documents from MongoDB
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
    await CartProduct.insertMany(docsToInsert);
    }
    else if(req.body.status_msg==="REMOVE"){
        const deletedProducts=await selectedProducts.deleteMany({})
    }

      

})

app.get("/getCartproducts", async (req, res) => {
  const CartData = await CartProduct.find(); // Fetch all documents from MongoDB
  res.json(CartData);               // Send JSON response
});

// In Express.js
app.delete("/removeCart", async (req, res) => {
  try {
    const { _id } = req.body;   // axios will send {data: {_id: "value"}}
    if (!_id) {
      return res.status(400).json({ error: "Product ID required" });
    }
    const result = await CartProduct.deleteOne({ _id: _id });

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
    const cartProduct = new CartProduct(req.body); // create new product
    await cartProduct.save(); // save to DB
    res.status(201).json({ message: "Product added to cart", data: cartProduct });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

 // keep in env variable
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
app.post("/chat", async (req, res) => {
  const { conversation } = req.body; // an array of messages

  if (!conversation || !conversation.length) {
    return res.status(400).json({ error: "Conversation is required" });
  }

  try {
    // Convert conversation into Gemini format
    const contents = conversation.map(msg => ({
      role: msg.sender === "user" ? "user" : "assistant",
      parts: [{ text: msg.text }]
    }));

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      { contents },
      { headers: { "Content-Type": "application/json" } }
    );
  
    const reply =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ No response from Gemini";

    res.json({ reply });
  } catch (error) {
    console.error("Gemini API error:", error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});
app.get("/get-csrf", (req, res) => {
  const csrfToken = require("crypto").randomBytes(24).toString("hex");


res.cookie("csrftoken", csrfToken, {
  httpOnly: true,  
  secure: true,    
  sameSite: "None" 
});


  res.json({ csrfToken });
});

app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    

      if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all details" });
      }

      // Check if user already exists
      const existingUser = await SignUp.findOne({ Email: email });
      if (existingUser) {
        return res.status(400).json({ message: "User already registered" });
      }

      // Insert new user
      const newUser = new SignUp({
        UserName: name,
        Email: email,
        Password: password,
      });

      await newUser.save();
      res.cookie("UserEmail", email, {httpOnly: true,secure: true,sameSite: "None",maxAge: 7 * 24 * 60 * 60 * 1000, path: "/"});
      res.cookie("UserName", name, {httpOnly: true,secure: true,sameSite: "None",maxAge: 7 * 24 * 60 * 60 * 1000, path: "/"});
      return res.status(201).json({ message: "Signup successful", user: newUser });
        
    

    
  } catch (error) {
    console.error("❌ Error in signup:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const {email, password } = req.body;


    if (!email || !password) {
      return res.status(400).json({ message: "Please fill all details" });
    }

    // Check user exists
    const user = await SignUp.findOne({ Email: email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check password
    if (user.Password !== password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Optional: log login history if needed
    //const NewUserLogin = new Login({ UserName: user.UserName, Email: user.Email,Password:user.Password });
    //await NewUserLogin.save();
    
    return res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    console.error("❌ Error in login:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

app.get("/logincheck", async (req, res) => {
  try {
    // ✅ Find the currently logged in user
    //const loggedUser = await Login.findOne(); // You can also use session/email from req if available
    const user = await SignUp.findOne({ Email: req.cookies.UserEmail });
    if (req.cookies.UserName) {
      if(!user.City || !user.State ||!user.Pincode||!user.Phone){
        return res.json({login:"notexist", status: false });
      }
      else{
        return res.json({login:"exist",status:true})
      }
      
    }
    else{
      return res.json({status: false, redirect: "/signup" });
    }


    const hasAddress =
      signUpUser.City && signUpUser.State && signUpUser.Pincode && signUpUser.Phone;

    if (!hasAddress) {
      return res.json({
        status: true,
        addressFilled: false,
        message: "notfilled",
      });
    }

    return res.json({
      status: true,
      addressFilled: true,
      message: "filled",
    });
  } catch (error) {
    console.error("Error in /logincheck:", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
});


app.get("/logincheckProfile", async (req, res) => {
  
    
    const loggedUser = req.cookies.UserEmail
    if (loggedUser) {
      return res.json({login:"exist"});
    }
  

});



// address route
app.post("/addressSave", async (req, res) => {
  try {
    const { city, state, pincode, phone } = req.body;
    if (!city || !state || !pincode || !phone) {
      return res.json({message: "Fill all address filed" });
    }
    // 🔹 Find the logged-in user in Login collection
   
    


    const updatedProduct = await SignUp.findOneAndUpdate(
      { Email: req.cookies.UserEmail},        // search by type
      {
        City:city,
        State:state,
        Pincode:pincode,
        Phone:phone,
      },              // new data to replace with
      { new: true, upsert: true } // return updated doc, create if not found
    );

    return res.json({ success: true, message: "Address saved successfully!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/fatchProfileDetails", async (req, res) => {
  try {

    const email = req.cookies.UserEmail // latest logged in user
    if (!email) {
      return res.status(400).json({ message: "No user logged in" });
    }

    const userDetails = await SignUp.findOne({ Email: email });
    if (!userDetails) {
      return res.status(404).json({ message: "User details not found" });
    }

    res.status(200).json(userDetails);
  } catch (err) {
    console.error("❌ Error in fetching profile details:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/logout", async (req, res) => {
  try {


    res.clearCookie("UserName",{ path: "/", sameSite: "None", secure: true })
    res.clearCookie("UserEmail",{ path: "/", sameSite: "None", secure: true })
    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.error("❌ Error in logout:", err);
    res.status(500).json({ message: "Server error during logout" });
  }
});

app.post("/profileImage",async(req,res)=>{
  const {url}=req.body
  const email=req.cookies.UserEmail
  const updatedProduct = await SignUp.findOneAndUpdate(
      { Email: email },        // search by type
      {
        ImageURL:url
      },              // new data to replace with
      { new: true, upsert: true } // return updated doc, create if not found
    );
    return res.json({ success: true, message: "Address saved successfully!" });

})

  app.post("/loginProductsManage", async (req, res) => {

      // 1. Get logged in user (assuming only one is logged in at a time)
      const email = req.cookies.UserEmail
    console.log(req.cookies.UserEmail+"Sssstttttttttttttt")
      if (!email) {
        return res.status(404).json({ error: "No logged in user found" });
      }



      // 2. Delete all previous products for this user
      await LoginUserProducts.deleteMany({ Email: email });

      // 3. Fetch products from both collections
      const SelectedProducts = await selectedProducts.find();
      const cartProducts = await CartProduct.find();

      // 4. Prepare new documents
      const formattedSelected = SelectedProducts.map((item) => {
      const obj = item.toObject();
      delete obj._id; // remove original id
      return {
        Email: email,
        ProductsPlace: "SelectedProducts",
        ...obj
      };
    });

    const formattedCart = cartProducts.map((item) => {
      const obj = item.toObject();
      delete obj._id; // remove original id
      return {
        Email: email,
        ProductsPlace: "CartProducts",
        ...obj
      };
    });

      // 5. Insert new combined data
      const allProducts = [...formattedSelected, ...formattedCart];

      await LoginUserProducts.insertMany(allProducts);

      return res.json({
        message: "Products updated successfully on logout",
        insertedCount: allProducts.length,
      });

    
  });


app.get("/prepareHistory", async (req, res) => {
  try {
    // 1. Find the logged-in user
    const email = req.cookies.UserEmail
    if (!email) {
      return res.status(404).json({ error: "No logged in user found" });
    }


    // 2. Get this user's saved products from LoginUserProducts
    const userProducts = await LoginUserProducts.find({ Email: email });

    // 3. Separate products
    const selectedToInsert = [];
    const cartToInsert = [];

    userProducts.forEach((item) => {
      const obj = item.toObject();
      delete obj._id;   // avoid duplicate key error
      delete obj.Email; // not needed in original collection
      delete obj.ProductsPlace;

      if (item.ProductsPlace === "SelectedProducts") {
        selectedToInsert.push(obj);
      } else if (item.ProductsPlace === "CartProducts") {
        cartToInsert.push(obj);
      }
    });

    // 4. Clear old collections (optional: if you want to replace)
    await selectedProducts.deleteMany({});
    await CartProduct.deleteMany({});

    // 5. Insert new ones
    if (selectedToInsert.length > 0) {
      await selectedProducts.insertMany(selectedToInsert);
    }
    if (cartToInsert.length > 0) {
      await CartProduct.insertMany(cartToInsert);
    }

    return res.json({
      message: "✅ History restored successfully",
      selectedCount: selectedToInsert.length,
      cartCount: cartToInsert.length,
    });

  } catch (error) {
    console.error("Error in /prepareHistory:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/createLoginCookie", async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and Email are required" });
    }

    // Set cookies
    res.cookie("UserEmail", email, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/"
    });

    res.cookie("UserName", name, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/"
    });

    // ✅ Send response back
    return res.status(200).json({ message: "Cookies created successfully" });

  } catch (error) {
    console.error("❌ Error in createLoginCookie:", error);
    return res.status(500).json({ message: "Server error" });
  }
});


app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
