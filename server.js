import dotenv from "dotenv";
dotenv.config();
import express from "express";
const app = express();
import methodOverride from "method-override";
import morgan from "morgan";
import session from "express-session";
import path from "path";

import "./db/connection.js";



import authController from "./controllers/auth.js";
import recipesController from './controllers/recipes.js';
import ingredientsController from './controllers/ingredients.js';


import { isSignedIn } from "./middleware/isSignedIn.js";


// server.js




import { passUserToView } from "./middleware/passToView.js";
import { fileURLToPath } from "url";

const port = process.env.PORT ? process.env.PORT : '3000';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(__dirname));


app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(morgan("dev"));
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
    })
);

app.get("/", (req, res) => {
    if (req.session.user) {
        res.redirect(`users/${req.session.user._id}/recipes`);
    } else {
        res.render("index.ejs", {
            user: req.session.user,
        });
    }
});


app.use('/auth', authController);
// app.use(passUserToView);
app.use(isSignedIn);
app.use("/users/:userId/recipes", recipesController);
app.use('/ingredients', ingredientsController);

app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`);
});
