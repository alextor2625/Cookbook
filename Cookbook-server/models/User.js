const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  cookbook: { type: Schema.Types.ObjectId, ref: "Cookbook" },
  image: {
    type: String,
    default:
      "https://res.cloudinary.com/dg2rwod7i/image/upload/v1697684925/Cookbook/placeholders/user/hlorfrxji0oxbygeulb2.png",
  },
},
{
    timestamps:true
});

module.exports = model("User", userSchema);

/*\ Users:
 *	    Name
 *	    Email
 *	    Password
 *	    Cookbook
 *	    Reviews **NOT NEEDED**
 *      Image
\*/