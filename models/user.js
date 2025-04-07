import mongoose from "mongoose";


const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});


const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
  },
  pantry: [foodSchema],
  recipes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }] // Added this line for recipes

})

const User = mongoose.model("User", userSchema);
export default User;
