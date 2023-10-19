const { Schema, model } = require("mongoose");

const cookbookSchema = new Schema({
  recipes:[{type:Schema.Types.ObjectId, ref:'Recipe'}],
  author: {type:Schema.Types.ObjectId, ref:'User'}
},
{
    timestamps:true
});

module.exports = model("Cookbook", cookbookSchema);

/*\ Cookbook:
 *      Recipes
\*/