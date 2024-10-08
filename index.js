const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://qucikcart-cc6c1.web.app",
    "https://qucikcart-cc6c1.firebaseapp.com",
  ],
  credentials: true,
  optionSuccessStatus: 200,
};
// middleware
app.use(cors(corsOptions));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.aea2zks.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const productCollection = client.db("quickCart").collection("products");

    // products apis
    //   get all products
    app.get("/products", async (req, res) => {
      const size = parseInt(req.query.size);
      const page = parseInt(req.query.page) - 1;
      const search = req.query.search || '';
  const timeSort = req.query.timeSort || null;
  const priceSort = req.query.priceSort || null;
      let query={
        name:{ $regex: search,$options:'i' },
      }
      // Build the sort object dynamically
  let sortOptions = {};
  if (timeSort) {
    sortOptions.createdAt = timeSort === "asc" ? 1 : -1;
  }
  if (priceSort) {
    sortOptions.price = priceSort === "asc" ? 1 : -1;
  }
      const result = await productCollection
        .find(query)
        .sort(sortOptions)  
        .skip(page * size)
        .limit(size)
        .toArray();
      res.send(result);
    });

    //   get all products count
    app.get("/products-count", async (req, res) => {
        const search=req.query.search

        let query={
            name:{ $regex: search,$options:'i' },
          }
    
      const count = await productCollection.countDocuments(query);
      res.send({ count });
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("QuickCart server is running");
});
app.listen(port, () => {
  console.log(`QuickCart running on port ${port}`);
});
