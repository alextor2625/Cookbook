var express = require("express");
var router = express.Router();

const User = require("../models/User");

const isAuthenticated = require("../middleware/isAuthenticated");

/* GET users listing. */
router.get("/profile/:userId", (req, res, next) => {
  const { userId } = req.params;
  User.findById(userId)
    .then(foundUser =>{
      if(!foundUser.cookbooks.lengh){
        if(foundUser.recipes.lengh){
          return foundUser.populate('recipes')
        }else{
          return foundUser;
        }
      }
      else if(!foundUser.recipes.lengh){
        if(foundUser.cookbooks.lengh){
          return foundUser.populate('cookbooks')
        }else{
          return foundUser;
        }
      }
      else{
        return foundUser.populate("recipes").populate("cookbooks")
      }
    })
    .then((user) => {
      const { _id, email, name, cookbooks, recipes, image } = user;
      const userInfo = { _id, email, name, cookbooks, recipes, image };
      res.json(userInfo);
    })
    .catch((err) => {
      console.log(err);
      res.json(err);
      next(err);
    });
});

router.post("/update/:userId", isAuthenticated, (req, res, next) => {
  User.findByIdAndUpdate(req.params.userId, req.body, { new: true })
    .then((updatedUser) => {
      if(!updatedUser.cookbooks.lengh){
        if(updatedUser.recipes.lengh){
          return updatedUser.populate('recipes')
        }else{
          return updatedUser;
        }
      }
      else if(!updatedUser.recipes.lengh){
        if(updatedUser.cookbooks.lengh){
          return updatedUser.populate('cookbooks')
        }else{
          return updatedUser;
        }
      }
      else{
        return updatedUser.populate("recipes").populate("cookbooks")
      }
    })
    .then((updatedUser) => {
      console.log(updatedUser);
      const { _id, email, name, cookbooks, recipes, image } = updatedUser;
      const user = { _id, email, name, cookbooks, recipes, image };
      authToken = jwt.sign(user, process.env.SECRET, {
        algorithm: "HS256",
        expiresIn: "6h",
      });
      res.json(user, authToken);
    })
    .catch((err) => {
      console.log(err);
      res.json(err);
      next(err);
    });
});

router.get('/my-recipes', (req, res, next) => {

})

module.exports = router;
