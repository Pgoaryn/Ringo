var mongoose = require('mongoose');
var UserSchema = mongoose.Schema(
   {
      email: {
         type: String,
         unique: true,
         required: true,
         match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
      },
      username: {
         type: String,
         unique: true,
         required: true
      },
      password: {
         type: String,
         required: true
      },
      role: {
         type: String
      },
      resetPasswordToken: String,
      resetPasswordExpires: Date,
   }
);
var UserModel = mongoose.model('users', UserSchema);
module.exports = UserModel;

