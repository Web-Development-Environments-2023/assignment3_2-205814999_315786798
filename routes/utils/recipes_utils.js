const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";



/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */
//, cuisine, diet, intolerance

async function getRecipeInformation(recipe_id) {
    return await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey
        }
    });
}

async function getRecipeBySearch(searchResult , limit){
    let info = [];
    //https://api.spoonacular.com/recipes/complexSearch?query=pasta&maxFat=25&number=2
    let recapies = await axios.get("https://api.spoonacular.com/recipes/complexSearch", {
        params: {
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey ,
            limit : limit ? limit : 2 , //5 by default
            query : searchResult
        }
    });
      console.log(recapies.data.results)
//    return recapies.data.results
    for (const recipe_info of recapies.data.results) {
        const recipeDetails = await getRecipeDetails(recipe_info.id)
        info.push(recipeDetails)
    }
    // console.log(info)
    return info

}

async function getInstructions(id){
    let recapies = await axios.get(`https://api.spoonacular.com/recipes/${id}/analyzedInstructions`, {
        params: {
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey,

        }
    });
    //  console.log(recapies.data[0].steps)
     return recapies.data[0].steps;
}


async function getRecipeDetails(recipe_id) {
    let recipe_info = await getRecipeInformation(recipe_id);
    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = recipe_info.data;
    let instruction = await getInstructions(recipe_id);
    //let { number, step } = instruction;
    let step = instruction.step
    // console.log(instruction);
    return {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        popularity: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,
        instruction : instruction
        
    }
}

async function getAllRecapies() {

    let recapies = await axios.get("https://api.spoonacular.com/recipes/random", {
        params: {
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey ,
            number : 15
        }
    });
    const info = extractPreviewRecipeDetails(recapies.data.recipes)
    console.log(recapies.data.recipes.length)
    return info
   
}

function extractPreviewRecipeDetails(recipes_info) {
    return recipes_info.map(async (recipe_info) => {
        //check the data type so it can work with diffrent types of data
        let data = recipe_info;
        if (recipe_info.data) {
            data = recipe_info.data;
        }
        const {
            id,
            title,
            readyInMinutes,
            image,
            aggregateLikes,
            vegan,
            vegetarian,
            glutenFree,
        } = data;
        return {
            id: id,
            title: title,
            image: image,
            readyInMinutes: readyInMinutes,
            popularity: aggregateLikes,
            vegan: vegan,
            vegetarian: vegetarian,
            glutenFree: glutenFree , 
        }
    })
  }

  
// async function extractInstructions(recipes_info) {
//     let arr = [];
  
//     for (const recipe_info of recipes_info) {
//       let instructions = await getInstructions(recipe_info.id);
//       if (recipe_info.data){
//         let data = getRecipeDetails(recipes_info.id)
//       }
//     console.log(recipes_info.id)
//     //   let data = recipe_info;
//     //   if (recipe_info.data) {
//     //     data = recipe_info.data;
//     //   }
      
//     //   const { id, title, image } = data;
//       arr.push({
//         data : data ,
//         instructions: instructions
//       });
//     }
//     return arr;
//   }

exports.getRecipeDetails = getRecipeDetails;
exports.getAllRecapies = getAllRecapies;
exports.getRecipeBySearch = getRecipeBySearch;


