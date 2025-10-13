// Script to update all users in MongoDB to have a 'role' field if missing
// Default role is 'user'. You can manually set specific users to 'admin' after running this.

const mongoose = require('mongoose');

const uri = 'mongodb+srv://dapkerushikesh:123456@eventy.l1rvzct.mongodb.net/eventy'; // Change to your DB name/connection string
const User = require('./models/User');

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const result = await User.updateMany(
      { role: { $exists: false } },
      { $set: { role: 'user' } }
    );
    console.log('Users updated:', result.nModified);
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error:', err);
    mongoose.disconnect();
  });
