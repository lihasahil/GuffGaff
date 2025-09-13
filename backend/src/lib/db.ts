import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    const { MONGO_USER, MONGO_PASS, MONGO_CLUSTER, MONGO_DB } = process.env;

    if (!MONGO_USER || !MONGO_PASS || !MONGO_CLUSTER || !MONGO_DB) {
      throw new Error("Missing required MongoDB environment variables");
    }

    const uri = `mongodb+srv://${encodeURIComponent(
      MONGO_USER
    )}:${encodeURIComponent(
      MONGO_PASS
    )}@${MONGO_CLUSTER}/${MONGO_DB}?retryWrites=true&w=majority`;

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5001,
    });

    console.log("MongoDB connected successfully");
  } catch (err: unknown) {
    const error = err as Error;
    console.log(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
