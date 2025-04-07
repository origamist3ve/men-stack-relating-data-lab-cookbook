import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    instructions: {
        type: String
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }, // Reference to User
    ingredients: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ingredient"
    }] // References to Ingredients
});

const Recipe = mongoose.model("Recipe", recipeSchema);
export default Recipe;
