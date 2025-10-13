// Script to promote a user to admin by email
// Usage: node promoteToAdmin.js user@example.com

const mongoose = require('mongoose');
const User = require('../models/User');

const uri = 'mongodb+srv://dapkerushikesh:123456@eventy.l1rvzct.mongodb.net/eventy'; // Change to your DB name/connection string

const email = process.argv[2];
if (!email) {
  console.error('Usage: node promoteToAdmin.js user@example.com');
  process.exit(1);
}

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const user = await User.findOneAndUpdate(
      { email },
      { $set: { role: 'admin' } },
      { new: true }
    );
    if (user) {
      console.log(`User ${email} promoted to admin.`);
    } else {
      console.log(`User with email ${email} not found.`);
    }
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error:', err);
    mongoose.disconnect();
  });
