const { Schema, model } = require("mongoose");

const reviewsSchema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: "User" },
    rating:{
        type:Number,
        min:0,
        max:5,
        default: 0 
    },
    comment:{
        type:String,
        maxLength: 500
    }
},
{
    timestamps:true
});

module.exports = model("Reviews", reviewsSchema);


/*\ Reviews:
 *      Author
 *      Rating
 *      Comment
\*/