import express from "express";
import path from "path";
import * as url from 'url';

import { MongoClient, ObjectId } from "mongodb";
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));


//MONGODB CLIENT SETUP
const dbUrl = "mongodb+srv://testdbuser:KqqIRLt1aZyFBY5X@cluster0.sckq1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"; //connection string for MongoDB (use 127.0.0.1 instead of "localhost" especially for Mac)
const client = new MongoClient(dbUrl); //create a new client by passing in the connection string
// Database Name
const dbName = 'HTTP5124';
//import required modules
/* const express = require("express");
const path = require("path"); */
//set up Express object and port
const app = express();
const port = process.env.PORT || "5214";

app.get("/image.png", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/img"));
});

// set up Expess to use pug as a template engine
app.set("views", path.join(__dirname, "templates"));
app.set("view engine", "pug");

// set up a folder path for static files (css, client-side js, image files)
app.use(express.static(path.join(__dirname, "public")));

//CONVERT URLENCODED FORMAT (FOR GET/POST REQUESTS) TO JSON
//UrlEncoded format is query string format (e.g. parameter1=value1&parameter2=value2)
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); //use JSON

app.get("/api/projects", async (request, response) => {
  let projects = await getProj();
  response.json(projects); 
});

//http://localhost:5214
app.get("/", async (request, response) => {
  // renders templates/layout.pug
  let projects = await getProj();
  console.log("Projects to render:", projects);
  response.render("index", { title: "Home", directory: projects });
});

app.get("/admin/project", async (request, response) => {
  let projects = await getProj();
  response.render("proj-list", { title: "Administer Directory", directory: projects });
})

app.get("/admin/project/add", async (request, response) => {
  let projects = await getProj();
  response.render("proj-add", { title: "Add a Project", directory: projects });
})

app.post("/admin/project/add/submit", async (request, response) => {
  //get data from form (data will be in request)
  //POST form: get data from request.body
  //GET form: get data from request.query
  //console.log(request.body);
  let newProj = {
    website_name: request.body.web,
    Github_username: request.body.username,
    URL: request.body.path,
    GitHub_repo: request.body.repo,
    screen: request.file.filename,
    date_added: new Date(),
   /*  number: request.body.projId */
  };
  await addLink(newProj);
  response.redirect("/admin/project");
})

app.get("/admin/project/delete", async (request, response) => {
  let id = request.query.projId;
  await deleteLink(id);
  response.redirect("/admin/menu");
})


//set up server listening
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});


// MongoDB Functions
async function connection() {
  try {
    await client.connect(); // Connect to MongoDB
    console.log("Connected successfully to MongoDB server");
    const db = client.db(dbName); // Select the database
    return db; // Return the database object
  } catch (error) {
    console.error("Error connecting to MongoDB: ", error);
    throw error;
  }
}

async function getProj() {
  try {
    const db = await connection(); // Use await because connection() is asynchronous
    let results = db.collection("directory").find({}).sort({ date_added: 1 }); // Find all entries and sort by date_added
    let projects = await results.toArray(); // Convert FindCursor to an array
    console.log("Projects fetched: ", projects); // Log the actual array of documents
    return projects; // Return the array of project data
  } catch (error) {
    console.error("Error fetching projects: ", error);
    return []; // Return an empty array in case of error
  }
}

export { getProj };


