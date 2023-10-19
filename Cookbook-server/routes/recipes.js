var express = require("express");
var router = express.Router();
const User = require("../models/User");
const Recipe = require("../models/Recipe");

router.get("/", (req, res, next) => {
  Recipe.find()
    .populate("author")
    .then((allRecipes) => {
      res.json(allRecipes);
    });
});

router.post("/create/:userId", (req, res, next) => {
  const { userId } = req.params;
  const { name, category, ingredients, instructions } = req.body;
  User.findById(userId)
    .then((foundUser) => {
      Recipe.create({
        name,
        category,
        ingredients,
        instructions,
        author: foundUser._id,
      })
        .then((newRecipe) => {
          User.findByIdAndUpdate(
            userId,
            { $push: { recipes: newRecipe._id } },
            { new: true }
          )
            .populate("recipes")
            .then((updatedUser) => {
              res.json(updatedUser);
            })
            .catch((err) => {
              console.log(err);
              res.json(err);
              next(err);
            });
        })
        .catch((err) => {
          console.log(err);
          res.json(err);
          next(err);
        });
    })
    .catch((err) => {
      console.log(err);
      res.json(err);
      next(err);
    });
});

router.post("/edit/:userId/:recipeId", (req, res, next) => {
  const { userId, recipeId } = req.params;
  const { name, category, ingredients, instructions } = req.body;

  Recipe.findById(recipeId).then((foundRecipe) => {
    if (ingredients != foundRecipe.ingredients || instructions != foundRecipe.instructions) 
    {
      User.findById(userId)
        .then((foundUser) => {
          return Recipe.create({
            name,
            category,
            ingredients,
            instructions,
            author: foundUser._id,
          }).catch((err) => {
            console.log(err);
            res.json(err);
            next(err);
          });
        })
        .then((newUpdatedRecipe) => {
          User.findByIdAndUpdate(
            userId,
            { $push: { recipes: newUpdatedRecipe._id } },
            { new: true }
          )
          .populate('recipes')
          .then(populatedUser => {
            res.json(populatedUser)
          })
          .catch((err) => {
            console.log(err);
            res.json(err);
            next(err);
          });
        })
        .catch((err) => {
          console.log(err);
          res.json(err);
          next(err);
        });
    }else{
        res.json({message: "No change was made."})
    }
  });
});


router.put('/update', (req,res,next) =>{

})

module.exports = router;
