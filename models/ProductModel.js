var mongoose = require('mongoose');
var ProductSchema = mongoose.Schema(
   {
      name: {
         type: String,
         required: true
      },
      image: String,
      description: String,
      category: {           //"category"    : name of reference field
         type: mongoose.SchemaTypes.ObjectId,
         ref: 'categories'  //"categories"  : name of reference collection
      }
   }
)
var ProductModel = mongoose.model("products", ProductSchema);
module.exports = ProductModel;


