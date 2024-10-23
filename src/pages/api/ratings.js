import { MongoClient } from "mongodb";

// Create a cached connection variable
let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable");
  }

  const client = new MongoClient(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await client.connect();
  const db = client.db("Falseshot");

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export default async function handler(req, res) {
  try {
    const { db } = await connectToDatabase();
    const ratings = db.collection("Ratings");

    if (req.method === "GET") {
      const allRatings = await ratings.find({}).toArray();
      const formattedRatings = allRatings.reduce((acc, rating) => {
        acc[rating.playlistId] = {
          up: rating.upvotes || 0,
          down: rating.downvotes || 0,
        };
        return acc;
      }, {});

      return res.status(200).json(formattedRatings);
    }

    if (req.method === "POST") {
      const { playlistId, rating } = req.body;
      const updateField = rating === "up" ? "upvotes" : "downvotes";

      await ratings.updateOne(
        { playlistId },
        { $inc: { [updateField]: 1 } },
        { upsert: true }
      );

      const updatedRatings = await ratings.find({}).toArray();
      const formattedRatings = updatedRatings.reduce((acc, rating) => {
        acc[rating.playlistId] = {
          up: rating.upvotes || 0,
          down: rating.downvotes || 0,
        };
        return acc;
      }, {});

      return res.status(200).json(formattedRatings);
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Database error:", error);
    return res
      .status(500)
      .json({ message: "Error processing request", error: error.message });
  }
}
