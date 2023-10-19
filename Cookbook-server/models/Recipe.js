const { Schema, model } = require("mongoose");

const recipeSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  category: String,
  ingredients: String,
  instructions: String,
  author: { type: Schema.Types.ObjectId, ref: "User" },
  image: {
    type: String,
    default:
      "https://res.cloudinary.com/dg2rwod7i/image/upload/v1697685097/Cookbook/placeholders/recipe/dyip7jnmoturdgnv4a4b.png",
  },
},
{
    timestamps:true
});

module.exports = model("Recipe", recipeSchema);

/*\  Recipe:
 *      Name
 *      Category
 *      Description
 *      Ingredients
 *      Instructions
 *      Image
 *      Author
\*/