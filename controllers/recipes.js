import express from 'express';
import User from '../models/user.js';
import Recipe from '../models/recipe.js';
import Ingredient from '../models/ingredient.js';


const router = express.Router();



// router logic will go here - will be built later on in the lab

router.get('/', async (req, res) => {
    try{
        const user = await User.findById(req.session.user).populate('recipes');


        res.render('recipes/index.ejs', {
            user: req.session.user,
            recipes: user.recipes,
        });
    }
    catch(err){
        console.error(err);
        res.redirect('/');
    }
});

router.get('/new',  (req, res) => {
    try {
        res.render("recipes/new", { user: req.session.user });
    } catch (error) {
        console.error(error);
        // TODO create an error template and render
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, instructions, ingredients = [] } = req.body;

        // Validate that name and instructions are provided
        if (!name || !instructions) {
            return res.status(400).send("Name and instructions are required");
        }

        // Handle ingredients as an array of strings (ensure it's an array)
        const ingredientNames = Array.isArray(ingredients) ? ingredients : ingredients.split(',').map(i => i.trim());

        // Find ingredients in the database
        const ingredientDocs = await Ingredient.find({
            name: { $in: ingredientNames }
        });

        // Ensure that the user exists in the session
        const user = await User.findById(req.session.user._id);
        if (!user) {
            return res.status(400).send("User not found");
        }

        // Create the new recipe with the ingredient references
        const newRecipe = new Recipe({
            name,
            instructions,
            owner: user._id,
            ingredients: ingredientDocs.map(i => i._id)
        });

        // Save the new recipe to the database
        await newRecipe.save();

        // Add the recipe to the user's list of recipes
        user.recipes.push(newRecipe._id);
        await user.save();

        // Redirect to the user's recipe list
        res.redirect(`/users/${user._id}/recipes`);
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal server error");
    }
});









router.get("/:recipeId", async (req, res) => {
    try {
        const { recipeId } = req.params;
        const recipe = await Recipe.findById(recipeId).populate('ingredients');
        if (!recipe) {
            console.error("Recipe not found");
            return res.redirect("/");
        }
        res.render("recipes/show", {
            user: req.session.user,
            recipe
        });
    } catch (error) {
        console.error(error);
        res.redirect("/");
    }
});



// router.post('/recipes', async (req, res) => {
//     try{
//         const {name, description, ingredients} = req.body;
//         if (!req.session.userId) {
//             return res.status(401).send("Unauthorized. Please log in.");
//         }
//
//         // Find the logged-in user
//         const user = await User.findById(req.session.userId);
//         if (!user) {
//             return res.status(404).send("User not found.");
//         }
//         const newRecipe = new Recipe( {
//             name,
//             description,
//             owner: user._id,
//             ingredients,
//         })
//         await newRecipe.save()
//
//         user.recipes.push(newRecipe._id);
//         res.redirect('/recipes');
//     }
//     catch(err){
//         res.send("There was an error")
//     }
// })






export default router;
