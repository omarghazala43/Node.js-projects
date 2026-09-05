import { model, Schema } from "mongoose";
import { Role } from "../../common/enums/role.js";
import { Gender } from "../../common/enums/gender.js";
import { System } from "../../common/enums/system.js";

const userSchema = new Schema(
  {
    fname: {
      type: String,
      trim: true,
      minLenght: 3,
      maxLenght: 20,
    },
    lname: {
      type: String,
      trim: true,
      minLenght: 3,
      maxLenght: 20,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      minLenght: 3,
      maxLenght: 20,
    },
    password: {
      type: String,
      // required: true,
      trim: true,
      minLenght: 3,
      maxLenght: 20,
    },
    confirmEmail: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.USER,
    },
    gender: {
      type: String,
      enum: Object.values(Gender),
      default: Gender.MALE,
    },
    age: {
      type: Number,
      min: 10,
      max: 60,
    },
    address: {
      city: String,
      country: String,
    },
    provider: {
      type: String,
      enum: Object.values(System),
      default: System.SYSTEM,
    },
    profileImage: String,
    coverImage: [String],
    isActive: {
      type: Boolean,
    },
    status: {
      type: String, // for banned users
    },
    changeCredential: Date,
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
  },
);

userSchema
  .virtual("fullname")
  .get(function () {
    return this.fname + " " + this.lname;
  })
  .set(function (val) {
    this.fname = val.split(" ")[0] || "";
    this.lname = val.split(" ")[1] || "";
  });

const User = model("User", userSchema);

export default User;
