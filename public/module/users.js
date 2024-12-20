import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

const dbUrl = `mongodb+srv://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}`;

// console.log("users",dbUrl);

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    email: { type: String, required: true },
    password: { type: String, required: true },
    createdDate: { type: Date, default: Date.now },
    sessionId: String,
  },
  {
    collection: "users",
  }
);
const Users = mongoose.model("users", UserSchema);

async function connect() {
  await mongoose.connect(dbUrl);
}

async function hashPassword(password) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

async function verifyPassword(password, hashedPassword) {
  const isMatch = await bcrypt.compare(password, hashedPassword);
  return isMatch;
}

async function initializeUsers() {
  await connect();
  const passFlora = await hashPassword("flora.123");
  const passAdam = await hashPassword("adam.123");
  const passTest = await hashPassword("test.123");
  const userList = [
    {
      username: "Flora",
      role: "admin",
      email: "flora@123.com",
      password: passFlora,
      createdDate: new Date("2024-11-01"),
      sessionId: "bvcdcegoier",
    },
    {
      username: "Adam",
      role: "admin",
      email: "adam@123.com",
      password: passAdam,
      createdDate: new Date("2024-11-01"),
      sessionId: "bhimcegoier",
    },
    {
      username: "test",
      role: "user",
      email: "test@123.com",
      password: passTest,
      createdDate: new Date("2024-11-01"),
      sessionId: "bhimcikdier",
    },
  ];
  await Users.insertMany(userList);
}

async function findOneByemail(inputEmail) {
  await connect();
  return await Users.findOne({ email: inputEmail }).exec();
}

async function findOneById(id) {
  await connect();
  const editId = { _id: new mongoose.Types.ObjectId(id) };
  return await Users.findOne(editId);
}

async function addUser(pUsername, pEmail, pPassword) {
  const hashedPass = await hashPassword(pPassword);
  await connect();
  let newUser = new Users({
    username: pUsername,
    email: pEmail,
    password: hashedPass,
    createdDate: Date.now(),
  });
  await Users.create(newUser);
}

async function addUserAdmin(pUsername, pEmail, pPassword, pRole) {
  const hashedPass = await hashPassword(pPassword);
  await connect();
  let newUser = new Users({
    username: pUsername,
    email: pEmail,
    password: hashedPass,
    role: pRole,
    createdDate: Date.now(),
  });
  await Users.create(newUser);
}

async function getUsers() {
  await connect();
  return await Users.find({}).sort({ createdDate: -1 }); //return array for find all
}

async function updateUser(filter, updatedUser) {
  await connect();
  let updUser = {
    username: updatedUser.username,
    email: updatedUser.email,
    role: updatedUser.role,
  };
  if (updatedUser.password) {
    const hashedPass = await hashPassword(updatedUser.password);
    updUser.password = hashedPass;
  }
  return await Users.updateOne(filter, { $set: updUser });
}

async function deleteUser(id) {
  await connect();
  let filter = { _id: new mongoose.Types.ObjectId(id) };
  return await Users.deleteOne(filter);
}

async function reset() {
  await connect();
  return await Users.deleteMany({});
}

const users = {
  initializeUsers,
  addUser,
  updateUser,
  getUsers,
  deleteUser,
  reset,
  verifyPassword,
  findOneByemail,
  addUserAdmin,
  findOneById,
  UserSchema,
};
export default users;
