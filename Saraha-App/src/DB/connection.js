import mongoose from "mongoose";

async function DBconnection() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("DB connected successfully");
  } catch (error) {
    console.log({ message: error.message });
  }
}

export default DBconnection;
