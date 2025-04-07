import express from 'express';
import User from '../models/user.js';
import Recipe from '../models/recipe.js';
import Ingredient from '../models/ingredient.js';


const router = express.Router();




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
    }
});





router.post('/', async (req, res) => {
    try {
        const { name, instructions, ingredients = [] } = req.body;

        if (!name || !instructions) {
            return res.status(400).send("Name and instructions are required");
        }

        const ingredientNames = Array.isArray(ingredients) ? ingredients : ingredients.split(',').map(i => i.trim());

        const ingredientDocs = await Ingredient.find({
            name: { $in: ingredientNames }
        });

        const user = await User.findById(req.session.user._id);
        if (!user) {
            return res.status(400).send("User not found");
        }

        const newRecipe = new Recipe({
            name,
            instructions,
            owner: user._id,
            ingredients: ingredientDocs.map(i => i._id)
        });

        await newRecipe.save();

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
            recipe,
            ingredients: recipe.ingredients
        });
    } catch (error) {
        console.error(error);
        res.redirect("/");
    }
});


router.delete("/:recipeId", async (req, res) => {
    try {
        const { recipeId } = req.params;
        await Recipe.deleteOne({ _id: recipeId });

        const user = await User.findById(req.session.user._id);
        user.recipes = user.recipes.filter(rid => rid.toString() !== recipeId);
        await user.save();

        res.redirect("/");
    } catch (error) {
        console.error(error);
        res.redirect("/");
    }
});

router.get("/:recipeId/edit", async (req, res) => {
    try {
        const { recipeId } = req.params;
        const recipe = await Recipe.findById(recipeId).populate('ingredients');
        if (!recipe) {
            console.error("Recipe not found");
            return res.redirect("/");
        }
        res.render("recipes/edit", {
            recipe,
            user: req.session.user,
            ingreidnets: recipe.ingredients
        });
    } catch (error) {
        console.error(error);
        res.redirect("/");
    }
});

router.put("/:recipeId", async (req, res) => {
    try {
        const { recipeId } = req.params;
        const recipe = await Recipe.findById(recipeId);
        if (!recipe) {
            console.error("Recipe not found");
            return res.redirect("/");
        }

        recipe.name = req.body.name;
        recipe.instructions = req.body.instructions;

        if (req.body.ingredients) {
            const ingredientNames = req.body.ingredients.split(',')
                .map(name => name.trim())
                .filter(name => name !== "");

            const ingredientDocs = await Ingredient.find({
                name: { $in: ingredientNames }
            });

            recipe.ingredients = ingredientDocs.map(i => i._id);
        }

        await recipe.save();
        res.redirect("/");
    } catch (error) {
        console.error(error);
        res.redirect("/");
    }
});






export default router;
