import mongoose from "mongoose";
import users from "./users.js";
import dotenv from "dotenv";
const { ObjectId } = mongoose.Types;
dotenv.config();

const dbUrl = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PWD}@${process.env.DB_ATLAS}`;

// console.log(dbUrl);
const projectSchema = new mongoose.Schema(
    {
        website_name: { type: String },
        Github_username:{ type: String, required: true },
        URL:{ type: String },
        screen: { type: String },
        GitHub_repo:{ type: String},
        date_added: { type: Date, default: Date.now },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',  
            required: false, 
        }
    },
    {
      collection: "projects",
    }
  );

const Projects = mongoose.model("projects", projectSchema);

async function connect() {
  await mongoose.connect(dbUrl);
}

async function initializeProjects(userId) {
    await connect();
    const projList = [
      {
        website_name: "template project",
        Github_username:"Adam",
        URL:"https://github.com/",
        screen: "/placeholder.png",
        GitHub_repo:"https://github.com/",
        date_added: new Date("2024-11-01"),
        createdBy: userId || null
      }
    ];
    console.log("myjsProjectList",projList);
    await Projects.insertMany(projList);
  }

  async function getProj() {
        await connect();
        const result=await Projects.find({}).populate('createdBy', 'email').sort({ createdDate: -1 });
        return result;
  }

  async function getUserProj(userId) {
    await connect();
    const user = await users.findOneById(userId);
    if (!user) {
        throw new Error("User not found");
    }
    const result = await Projects.find({ createdBy: user._id }).populate('createdBy', 'email').sort({ createdDate: -1 }).exec();
    return result;
}
  
  async function addProj(projToAdd) {
    await connect();
    const result=Projects.create(projToAdd);
    await result;
  }
  
  async function deleteProj(id) {
    await connect();    
    let filter = { _id: new ObjectId(id) }; 
    const result=await Projects.deleteOne(filter);
    return result;
  }
  
  async function getSingleProj(id) {
    await connect();
    const editId = { _id: new mongoose.Types.ObjectId(id) };
    const result = await Projects.findOne(editId);
    return result;
  }
  
  async function editProj(filter, project) {
    await connect();
     const options = { upsert: true };
    // Specify the update to set a value for the link field
    let updateProj = {
      $set: {
        website_name: project.website_name,
        Github_username: project.Github_username,
        URL: project.URL,
        GitHub_repo: project.GitHub_repo,
        // date_added: new Date(),
        // createdBy:project.createdBy,
      }
  };
  if (project.screen) {
    updateProj.$set.screen = project.screen;
  }
    let result = await Projects.updateOne(filter, updateProj,options);
    // Print the number of matching and modified documents
    // https://www.mongodb.com/docs/drivers/node/current/usage-examples/updateOne/#std-label-node-usage-updateone
    console.log(
      `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
    );
  }
  
  const projects = {
    initializeProjects,
    getProj,
    addProj,
    deleteProj,
    getSingleProj,
    editProj,
    getUserProj
  };
  export default projects;
  
  