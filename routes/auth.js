var express = require('express')
var router = express.Router()
var UserModel = require('../models/UserModel');
var crypto = require('crypto');
var nodemailer = require('nodemailer');

//import "bcryptjs" library
var bcrypt = require('bcryptjs');
var salt = 8;                     //random value

router.get('/register', (req, res) => {
   res.render('auth/register', { layout: 'auth_layout' })
})

router.post('/register', async (req, res) => {
   try {
      var userRegistration = req.body;
      console.log('userRegistration:', userRegistration);
      var hashPassword = bcrypt.hashSync(userRegistration.password, salt);
      var user = {
         email: userRegistration.email,
         username: userRegistration.username,
         password: hashPassword,
         role: 'user'
      }
      await UserModel.create(user);
      res.redirect('/auth/login')
   } catch (err) {
      res.send(err)
   }
})

router.get('/login', (req, res) => {
   res.render('auth/login', { layout: 'auth_layout' })
})

router.post('/login', async (req, res) => {
   try {
      var userLogin = req.body;
      var user = await UserModel.findOne({ username: userLogin.username })
      if (user) {
         var hash = bcrypt.compareSync(userLogin.password, user.password)
         if (hash) {
            //initialize session after login success
            req.session.username = user.username;
            req.session.role = user.role;
            if (user.role == 'admin') {
               res.redirect('/admin');
            }
            else {
               res.redirect('/');
            }
         }
         else {
            res.redirect('/auth/login');
         }
      }
   } catch (err) {
      res.send(err)
   }
});

router.get('/logout', (req, res) => {
   req.session.destroy();
   res.redirect("/auth/login");
});

router.get('/forgot-password', (req, res) => {
   res.render('auth/forgot-password');
 });

 router.post('/forgot-password', async (req, res) => {
   try {
      const email = req.body.email;
      const user = await UserModel.findOne({ email });

      if (!user) {
         return res.render('auth/forgot-password', { error: 'User not found' });
      }

      // Generate a unique token
      const token = crypto.randomBytes(20).toString('hex');

      // Set token and expiration in the user's document
      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 3600000; // Token is valid for 1 hour

      await user.save();

      // Send the password reset email (using nodemailer)
      const transporter = nodemailer.createTransport({
         service: 'gmail',
         auth: {
            user: 'ringotowntest@gmail.com',
            pass: 'akaj nngk lcyk ldnl',
         },
      });

      const resetLink = `http://${req.headers.host}/auth/forgot-password/${token}`;
      const mailOptions = {
         from: 'ringotowntest@gmail.com',
         to: user.email,
         subject: 'Password Reset',
         text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
               `Please click on the following link, or paste this into your browser to complete the process:\n\n${resetLink}\n\n` +
               `If you did not request this, please ignore this email and your password will remain unchanged.`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
         if (error) {
            console.error(error);
            return res.render('auth/forgot-password', { error: 'Error sending email' });
         }
         console.log('Email sent: ' + info.response);
         res.render('auth/forgot-password', { success: 'Password reset email sent' });
      });

   } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
   }
 });

 router.get('/forgot-password/:token', async (req, res) => {
   try {
      const token = req.params.token;
      const user = await UserModel.findOne({
         resetPasswordToken: token,
         resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
         return res.render('auth/forgot-password', { error: 'Invalid or expired token' });
      }

      res.render('auth/reset-password', { token });
   } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
   }
});

router.post('/reset-password/:token', async (req, res) => {
   try {
      const token = req.params.token;
      const newPassword = req.body.newPassword;

      const user = await UserModel.findOne({
         resetPasswordToken: token,
         resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
         return res.render('auth/reset-password', { error: 'Invalid or expired token' });
      }

      // Update the user's password
      user.password = bcrypt.hashSync(newPassword, salt);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      await user.save();

      res.render('auth/reset-password', { success: 'Password reset successfully' });
   } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
   }
});

module.exports = router