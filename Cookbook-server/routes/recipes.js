var express = require("express");
var router = express.Router();
const User = require("../models/User");
const Recipe = require("../models/Recipe");
const isAuthenticated = require("../middleware/isAuthenticated");
const jwt = require("jsonwebtoken");

//Get all recipes
router.get("/allRecipes", (req, res, next) => {
  Recipe.find()
    .populate("author")
    .then((allRecipes) => {
      res.json(allRecipes);
    })
    .catch((err) => {
      console.log(err);
      res.json(err);
      next(err);
    });
});

// Get all user recipes
router.get("/myRecipes", isAuthenticated, (req, res, next) => {
  User.findById(req.user._id)
    .then((foundUser) => {
      if (foundUser.recipes.length) {
        return foundUser
          .populate("recipes")
          .then((foundUser) => {
            res.json(foundUser.recipes);
          })
          .catch((err) => {
            console.log(err);
            res.json(err);
            next(err);
          });
      } else {
        res.json(foundUser.recipes);
      }
    })
    .catch((err) => {
      console.log(err);
      res.json(err);
      next(err);
    });
});
// Create a new recipe
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
              const { _id, email, name, cookbooks, recipes, image } =
                updatedUser;
              const user = { _id, email, name, cookbooks, recipes, image };
              authToken = jwt
                .sign(user, process.env.SECRET, {
                  algorithm: "HS256",
                  expiresIn: "6h",
                })
              res.json({ user, authToken });
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

// Copies a recipe from another user if they change ingredients or
// instructions and adds it to the current user's recipe list and
// gives changes the alteredBy property to the current user's id.
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
            .then((updatedUser) => {
              const { _id, email, name, cookbooks, recipes, image } =
                updatedUser;
              const user = { _id, email, name, cookbooks, recipes, image };
              authToken = jwt.sign(user, process.env.SECRET, {
                algorithm: "HS256",
                expiresIn: "6h",
              });
              res.json({ user, authToken });
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

// Updates a recipe you are the author of.
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

// Pins a recipe from another user without changing anything.
router.put("/add/:recipeId", isAuthenticated, (req, res, next) => {
  Recipe.findById(req.params.recipeId).then((foundRecipe) => {
    User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { recipes: foundRecipe._id } },
      { new: true }
    )
      .then((updatedUser) => {
        const { _id, email, name, cookbooks, recipes, image } = updatedUser;
        const user = { _id, email, name, cookbooks, recipes, image };
        authToken = jwt.sign(user, process.env.SECRET, {
          algorithm: "HS256",
          expiresIn: "6h",
        });
        res.json({ user, authToken });
      })
      .catch((err) => {
        console.log(err);
        res.json(err);
        next(err);
      });
  });
});

// Deletes recipes you are the author of from the collection of recipes
// and from every user's recipe list with the expeption of edited
// versions of the same recipe from other users.
router.delete("/delete/:recipeId", isAuthenticated, (req, res, next) => {
  const { recipeId } = req.params;
  Recipe.findByIdAndDelete(recipeId)
    .then((deletedRecipe) => {
      User.findById(req.user._id)
        .then((foundUser) => {
          // Need to add a condition to block the ones that are not owners from deleting 
            User.updateMany(
              { recipes: recipeId },
              { $pull: { recipes: recipeId } },
              { new: true }
            )
            .then(updatedUsers=> console.log(updatedUsers,'HERE'))
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
      User.findById(req.user._id)
        .populate("recipes")
        .then((updatedUser) => {
          const { _id, email, name, cookbooks, recipes, image } = updatedUser;
          const user = { _id, email, name, cookbooks, recipes, image };
          authToken = jwt.sign(user, process.env.SECRET, {
            algorithm: "HS256",
            expiresIn: "6h",
          });
          res.json({ user, authToken });
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

// Removes recipes the current user pinned. Does not remove them from
// the main recipe collection.
router.delete("/remove/:recipeId", isAuthenticated, (req, res, next) => {
  const { recipeId } = req.params;
  User.findByIdAndUpdate(
    req.user._id,
    { $pull: { recipes: recipeId } },
    { new: true }
  )
    .populate("recipes")
    .then((updatedUser) => {
      const { _id, email, name, cookbooks, recipes, image } = updatedUser;
      const user = { _id, email, name, cookbooks, recipes, image };
      authToken = jwt.sign(user, process.env.SECRET, {
        algorithm: "HS256",
        expiresIn: "6h",
      });
      res.json({ user, authToken });
    })
    .catch((err) => {
      console.log(err);
      res.json(err);
      next(err);
    });
});

module.exports = router;
