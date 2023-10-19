var express = require("express");
var router = express.Router();
const User = require("../models/User");
const Recipe = require("../models/Recipe");
const isAuthenticated = require("../middleware/isAuthenticated");

router.get("/allrecipes", (req, res, next) => {
  Recipe.find()
    .populate("author")
    .then((allRecipes) => {
      res.json(allRecipes);
    });
});

router.post("/create", isAuthenticated, (req, res, next) => {
  const userId = req.user._id;
  const { name, category, ingredients, instructions } = req.body;
  User.findById(userId)
    .then((foundUser) => {
      Recipe.create({
        name,
        category,
        ingredients,
        instructions,
        author: foundUser._id,
        alteredBy: foundUser._id,
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

router.post("/edit/:recipeId", isAuthenticated, (req, res, next) => {
  const userId = req.user._id;
  const { recipeId } = req.params;
  const { name, category, ingredients, instructions } = req.body;

  Recipe.findById(recipeId).then((foundRecipe) => {
    if (
      ingredients != foundRecipe.ingredients ||
      instructions != foundRecipe.instructions
    ) {
      User.findById(userId)
        .then((foundUser) => {
          return Recipe.create({
            name,
            category,
            ingredients,
            instructions,
            author: foundRecipe.author,
            alteredBy: foundUser._id,
            image: foundRecipe.image,
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
            .populate("recipes")
            .then((populatedUser) => {
              res.json(populatedUser);
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
    } else {
      res.json({
        message: "User did not make a significant change to the recipe.",
      });
    }
  });
});

router.put("/update/:recipeId", isAuthenticated, (req, res, next) => {
  const { recipeId } = req.params;
  const { name, category, ingredients, instructions, image } = req.body;
  Recipe.findById(recipeId).then((foundRecipe) => {
    if (foundRecipe.alteredBy == req.user._id) {
      Recipe.findByIdAndUpdate(
        recipeId,
        {
          name,
          category,
          ingredients,
          instructions,
          image,
        },
        { new: true }
      )
        .then((foundRecipe) => {
          res.json(foundRecipe);
        })
        .catch((err) => {
            console.log(err);
            res.json(err);
            next(err);
          });
    } else {
      res.json({ message: "User is not this recipe's author." });
    }
  });
});

router.delete("/delete/:recipeId", isAuthenticated, (req, res, next) => {
    const {recipeId} = req.params
    Recipe.findByIdAndDelete(recipeId)
    .then(deletedRecipe => {
        User.findByIdAndUpdate(req.user._id,{$pull:{recipes:recipeId}}, {new:true})
        .populate('recipes')
        .then(updatedUser => {
            res.json(deletedRecipe ,updatedUser)
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

module.exports = router;
