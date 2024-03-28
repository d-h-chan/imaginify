import mongoose, { Mongoose } from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL;

interface MongooseConnection {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

/** Nextjs runs in a serverless environment (functions are stateless)
 * without maintaining a connection to db's, ensuring each request is handled
 * independently so that the application can be scalable and reliability. However,
 * if we don't cache the Mongodb connection, there would be way too many diffrent
 * connections made, one for each request.
 */
let cached: MongooseConnection = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = {
    conn: null,
    promise: null,
  };
}

export const connectToDatabase = async () => {
  // check if we already have a cached connection
  if (cached.conn) return cached.conn;

  if (!MONGODB_URL) throw new Error("Missing MONDOB_URL");

  // if not, make a connection to MongoDB
  cached.promise =
    cached.promise ||
    mongoose.connect(MONGODB_URL, {
      dbName: "imaginify",
      bufferCommands: false,
    });

  cached.conn = await cached.promise;

  return cached.conn;
};
