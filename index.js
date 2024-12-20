import express from "express";
import path from "path";
import * as url from 'url';
import multer from "multer";
//import fs from "fs";
import cookieParser from "cookie-parser";
import session from "express-session";
import flash from "connect-flash";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';
import users from './public/module/users.js'; 
import projects from './public/module/projects.js'; 
import dotenv from "dotenv";
dotenv.config();

import { MongoClient, ObjectId } from "mongodb";
const _dirname = url.fileURLToPath(new URL('.', import.meta.url));

//MONGODB CLIENT SETUP
const dbUrl = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PWD}@${process.env.DB_ATLAS}`;

// const dbUrl = "mongodb+srv://testdbuser:KqqIRLt1aZyFBY5X@cluster0.sckq1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"; 
const client = new MongoClient(dbUrl); 
const app = express();
const port = process.env.PORT || "5214";

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/img')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
var upload = multer({ storage: storage })

app.use(express.static('public/img'));

// set up Expess to use pug as a template engine
app.set("views", path.join(_dirname, "templates"));
app.set("view engine", "pug");

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(_dirname, "public")));
app.use(express.json());
app.use(flash());

const oneDay = 1000 * 60 * 60 * 24;
app.use(cookieParser());
app.use(
  session({
    secret: `${process.env.SESSION_SECRET}`,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: oneDay },
    resave: false,
  }));

app.use((req, res, next) => {
  app.locals.userSession = req.session.user || null; 
  console.log("Current user session: ", req.session.user); 
  next();
});

app.get("/login", async (req, res) => {
  try {
    const error = req.flash("error");
    let userList = await users.getUsers();
    // console.log(userList);
    if (!userList.length) {
      await users.initializeUsers();
      userList = await users.getUsers();
    }
    res.render("login", { title: "Login", messages: { error } });
  } catch (err) {
    console.error("Error fetching users:", err);
    req.flash("error", "An error occurred while fetching users.");
    res.redirect("/login");
  }
});

app.post("/login/submit", async (req, res) => {
  const { email, password } = req.body;
  let userResult = await users.findOneByemail(email);
  console.log("login submit");
  if (userResult) {
    const verifyValue = await users.verifyPassword(password, userResult.password);
    if (verifyValue) {
      const sessionId = uuidv4();
      userResult.sessionId = sessionId;
      await userResult.save();
      res.cookie("sessionId", sessionId, { maxAge: oneDay, httpOnly: true });
      req.session.user = {
        userId: userResult._id, 
        username: userResult.username,
        role: userResult.role,
        email: userResult.email,
      };     
      // console.log("Session after login: ", req.session.user); 
      if(req.session.user.role)
      return res.redirect("/admin/project");
    } else {
      req.flash("error", "Password incorrect");
      return res.redirect("/login");
    }
  } else {
    req.flash("error", "No user with that email");
    return res.redirect("/login");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

app.get("/register", async (req, res) => {
  const error = req.session.error || null;
  req.session.error = null;
  res.render("register", {
    title: "Create a New Account",
    messages: { error },
  });
});

app.post("/register", async (req, res) => {
  const error = req.session.error || null;
  req.session.error = null;
  const { name, email, password } = req.body;
  let userResult = await users.findOneByemail(email);
  if (userResult) {
    return res.render("register", {
      title: "Create a New Account",
      messages: { error: "Email already in use. Please sign in." },
    });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.render("register", {
      title: "Create a New Account",
      messages: { error: "Email invalid." },
    });
  }
  await users.addUser(name, email, password);
  res.redirect("/login");
});

app.get("/api/projects", async (req, res) => {
  let projList = await projects.getProj();
  res.json(projList); 
});

//http://localhost:5214
app.get("/", async (req, res) => {
  let userSession=req.session.user || null;
  console.log(userSession);
  let projList = await projects.getProj();
  if (!projList.length&&(userSession)) {
    const initializeProj= await projects.initializeProjects(userSession.userId);
    console.log(initializeProj);
    projList = await projects.getProj();
  }
  console.log("Projects to render:", projList);
  res.render("index", { title: "Home", directory: projList, userSession: req.session.user || null });
});

// ADMIN - Project
app.get("/admin/project", async (req, res) => {
  console.log("Session Data:", req.session.user);
  if (!req.session.user) {
    return res.redirect("/login"); 
  }
  let projList = await projects.getProj();
  console.log("admin",req.session.user);
  if (!projList.length) {
    await projects.initializeProjects(req.session.user.userId);
    projList = await projects.getProj();
  }
  console.log("initialprojects:",projList);
  console.log("users",req.session.user);
  let title = "Administer Directory Projects";
  if(req.session.user.role==="user"){  
    projList = await projects.getUserProj(req.session.user.userId);
    title = "My Projects";
  }
  const formatProjList = projList.map((proj) => {
    proj.createdDateFormatted = new Date(proj.date_added)
      .toISOString()
      .split("T")[0];
    return proj;
  });
  console.log(projList);
  res.render("proj-list", { title: title, directory: formatProjList, userSession: req.session.user || null });
});

app.get("/admin/project/add", async (req, res) => {
  console.log("Session Data:", req.session.user);
  if (!req.session.user) {
    return res.redirect("/login"); 
  }
  let projList = await projects.getProj();
  if (!projList.length) {
    await projects.initializeProjects(req.session.user.id);
    projList = await projects.getProj();
  }
  res.render("proj-add", { title: "Add New Project", directory: projList, userSession: req.session.user || null});
})

app.post("/admin/project/add/submit", upload.single('screen'),async (req, res) => {
  console.log("form",req.body);
  console.log("Session Data:", req.session.user);
  if (!req.session.user) {
    return res.redirect("/login"); 
  }
  let newProj = {
    website_name: req.body.website_name,
    Github_username: req.body.Github_username,
    URL: req.body.URL,
    GitHub_repo: req.body.GitHub_repo,
    screen: req.file.filename,
    date_added: new Date(),
    createdBy:req.session.user.userId,
   /*  number: req.body.projId */
  };
  await projects.addProj(newProj);
  res.redirect("/admin/project");
})

app.get("/admin/project/delete", async (req, res) => {
  let id = req.query.projId;
  console.log("Session Data:", req.session.user);
  if (!req.session.user) {
    return res.redirect("/login"); 
  }
  await projects.deleteProj(id);
  res.redirect("/admin/project");
})

app.get("/admin/project/edit", async (req, res) => {
  console.log("Session Data:", req.session.user);
  if (!req.session.user) {
    return res.redirect("/login"); 
  }
  if (req.query.projId) {
    let projToEdit = await projects.getSingleProj(req.query.projId);
    let projList = await projects.getProj();
    res.render("proj-edit", { title: "Edit the Project", directory: projList, editProj: projToEdit, userSession: req.session.user || null });
  }
  else {
    res.redirect("/admin/project");
  }
});

app.post("/admin/project/edit/submit", upload.single('screen'),async (req, res) => { 
  console.log("Session Data:", req.session.user);
  if (!req.session.user) {
    return res.redirect("/login"); 
  }let id = req.body.projId; 
  console.log(id);
  let idFilter = { _id: new ObjectId(id)};
  console.log(idFilter);
  //get detailed form values and build a JSON object containing these (updated) values
  let editScreen = req.file ? req.file.filename : req.body.screen;
  let project = {
    website_name: req.body.website_name,
    Github_username: req.body.Github_username,
    URL: req.body.URL,
    GitHub_repo: req.body.GitHub_repo,
    screen: editScreen,
    // date_added: new Date(),
    // createdBy:req.session.user.userId
  };
  //run editLink(idFilter, link) and await the result
  console.log(idFilter);
  await projects.editProj(idFilter, project);
  res.redirect("/admin/project");
})
 
// ADMIN - User
app.get("/admin/user", async (req, res) => {
  console.log("Session Data:", req.session.user);
  if (!req.session.user) {
    return res.redirect("/login"); 
  }
  let userList = await users.getUsers();
  if (!userList.length) {
    await users.initializeUsers();
    userList = await users.getUsers();
  }
  const formatUserList = userList.map((user) => {
    user.createdDateFormatted = new Date(user.createdDate)
      .toISOString()
      .split("T")[0];
    return user;
  });
  console.log(req.session.user);
  res.render("user-list", { title: "Students in HTTP5214", students: formatUserList, userSession: req.session.user || null });
});

app.get("/admin/user/add", async (req, res) => {
  console.log("Session Data:", req.session.user);
  if (!req.session.user) {
    return res.redirect("/login"); 
  }
  let userList = await users.getUsers();
  if (!userList.length) {
    await users.initializeUsers();
    userList = await users.getUsers();
  }
  res.render("user-add", { title: "Create a New Account", students: userList, userSession: req.session.user || null});
})

app.post("/admin/user/add/submit", async (req, res) => {  
  console.log("Session Data:", req.session.user);
  if (!req.session.user) {
    return res.redirect("/login"); 
  }
  const { username, email, password, role } = req.body;
  let userResult = await users.findOneByemail(email);
  if (userResult) {
    return render("user-add", {
      title: "Create a New Account",
      messages: { error: "Email already in use." },
    });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.render("user-add", {
      title: "Create a New Account",
      messages: { error: "Email invalid." },
    });
  }
  await users.addUserAdmin(username, email, password, role);
  res.redirect("/admin/user"); 
})

app.get("/admin/user/delete", async (req, res) => {
  console.log("Session Data:", req.session.user);
  if (!req.session.user) {
    return res.redirect("/login"); 
  }
  let id = req.query.userId;
  await users.deleteUser(id);
  res.redirect("/admin/user");
})

app.get("/admin/user/edit", async (req, res) => {
  console.log("Session Data:", req.session.user);
  if (!req.session.user) {
    return res.redirect("/login"); 
  }
    let userToEdit = await users.findOneById(req.query.userId);
    let userList = await users.getUsers();
    res.render("user-edit", { title: "Edit User", students: userList, editUser: userToEdit, userSession: req.session.user || null });
  });

app.post("/admin/user/edit/submit", async (req, res) => {
  console.log("Session Data:", req.session.user);
  if (!req.session.user) {
    return res.redirect("/login"); 
  }
  let id = req.body.userId; 
  console.log(id);
  let idFilter = { _id: new ObjectId(id)};

  let updatedUser = {
    username: req.body.username,
    email: req.body.email,
    role: req.body.role,
    password: req.body.password,
    date_added: new Date()
  };

  console.log(idFilter,updatedUser);
  await users.updateUser(idFilter, updatedUser);
  res.redirect("/admin/user");
})



//set up server listening
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});



