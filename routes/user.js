var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");
const { DateTime } = require("mssql");

/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) {
  if (req.session && req.session.user_id) {
    DButils.execQuery("SELECT user_id FROM users").then((users) => {
      if (users.find((x) => x.user_id === req.session.user_id)) {
        req.user_id = req.session.user_id;
        next();
      }
    }).catch(err => next(err));
  } else {
    res.sendStatus(401);
  }
});


/**
 * This path gets body with recipeId and save this recipe in the favorites list of the logged-in user
 */
router.post('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipe_id = req.body.recipeId;
    const isFavorited = await user_utils.checkIfFavorite(user_id,recipe_id);
    if(isFavorited){
      throw { status: 409, message: "Already favorited." };
    }
    await user_utils.markAsFavorite(user_id,recipe_id);
    res.status(200).send("The Recipe successfully saved as favorite");
    } catch(error){
    next(error);
  }
})

/**
 * This path gets body with recipeId and save this recipe in the favorites list of the logged-in user
 */
router.delete('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipe_id = req.body.recipeId;
    await user_utils.removeAsFavorite(user_id,recipe_id);
    res.status(200).send("The Recipe Removed as favorite");
    } catch(error){
    next(error);
  }
})

/**
 * This path gets body with recipeId and save this recipe in the favorites list of the logged-in user
 */
router.post('/liked', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipe_id = req.body.recipeId;
    const isLiked = await user_utils.checkIfLiked(user_id,recipe_id);
    if(isLiked){
      throw { status: 409, message: "The Recipe is already marked as liked." };
    }
    await user_utils.markAsLiked(user_id,recipe_id);
    await user_utils.updateRecipePopularity(recipe_id,'increment');
    res.status(200).send("The Recipe popularity successfully updated.");
    } catch(error){
    next(error);
  }
})

/**
 * This path gets body with recipeId and save this recipe in the favorites list of the logged-in user
 */
router.delete('/liked', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipe_id = req.body.recipeId;
    await user_utils.removeAsLiked(user_id,recipe_id);
    await user_utils.updateRecipePopularity(recipe_id,'decrement');
    res.status(200).send("The Recipe popularity successfully updated.");
    } catch(error){
    next(error);
  }
})

/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */
router.get('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipes_id = await user_utils.getFavoriteRecipes(user_id);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    const results = await recipe_utils.getRecipeDetailsArr(recipes_id_array);
    res.status(200).send(results);
  } catch(error){
    next(error); 
  }
});

/**
 * This path gets body with recipeId and save this recipe in the watched list of the logged-in user
 */
router.post('/lastwatched', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipe_id = req.body.recipeId;
    await user_utils.markAsWatched(user_id,recipe_id);
    res.status(200).send("The Recipe successfully saved as watched");
    } catch(error){
    next(error);
  }
})

/**
 * This path returns the last 3 watched recipes by the logged-in user
 */
router.get('/lastwatched', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipes_id = await user_utils.getLastWatchedRecipes(user_id);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    const results = await recipe_utils.getRecipeDetailsArr(recipes_id_array);
    res.status(200).send(results);
  } catch(error){
    next(error); 
  }
});

/**
 * This path returns the users created recipes
 */
router.get('/myrecipes', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipes_id = await user_utils.getMyRecipes(user_id);
    let recipes_id_array = [];
    // recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    // const results = await recipe_utils.getRecipeDetailsArr(recipes_id_array);
    res.status(200).send(recipes_id);
  } catch(error){
    next(error); 
  }
});

router.get('/myrecipes', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipes_id = await user_utils.getMyRecipes(user_id);
    let recipes_id_array = [];
    // recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    // const results = await recipe_utils.getRecipeDetailsArr(recipes_id_array);
    res.status(200).send(recipes_id);
  } catch(error){
    next(error); 
  }
});


/**
 * This path gets body with recipeId and save this recipe in the watched list of the logged-in user
 */
router.post('/createrecipe', async (req,res,next) => {
  try{
    const {
      title,
      image,
      readyInMinutes,
      vegeterian,
      vegan,
      gluten_free,
      servings,
      instructions,
      ingridients
    } = req.body;
    const user_id = req.session.user_id;

    await user_utils.createRecipe(
      user_id,
      title,
      image,
      readyInMinutes,
      vegeterian,
      vegan,
      gluten_free,
      ingridients,
      instructions,
      servings
    );
    res.status(200).send("The Recipe successfully created");
    } catch(error){
    next(error);
  }
})


module.exports = router;
