const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const User = require('../models/User');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/eventy');
    console.log('✅ MongoDB connected for seeding');
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
    process.exit(1);
  }
};

// Sample users
const sampleUsers = [
  {
    name: 'Rushi',
    email: 'rushi@gmail.com',
    password: '123456',
    displayName: 'Rushi',
    phone: '+91 9876543210',
    address: 'Pune, Maharashtra'
  }
];

// Sample events (matching the frontend data structure)
const sampleEvents = [
  {
    title: 'Pune Music & Arts Festival 2025',
    description: 'Experience the vibrant culture of Pune with live performances by top artists, art installations, and local food stalls.',
    date: '2025-10-15',
    time: '14:00',
    location: 'Mahalaxmi Lawns, Karve Nagar, Pune',
    price: 2999,
    capacity: 1000,
    availableSeats: 750,
    imageUrl: 'images/event1.jpg',
    category: 'Music'
  },
  {
    title: 'Tech Innovation Summit 2025',
    description: 'Join leading tech experts and innovators for a day of cutting-edge presentations, networking, and insights into future technologies.',
    date: '2025-10-20',
    time: '09:00',
    location: 'JW Marriott Hotel, Senapati Bapat Road, Pune',
    price: 4999,
    capacity: 500,
    availableSeats: 200,
    imageUrl: 'images/tech-summit.jpg',
    category: 'Technology'
  },
  {
    title: 'Maharashtra Food Festival',
    description: 'Discover the rich culinary heritage of Maharashtra with top chefs, food artisans, and traditional cooking demonstrations.',
    date: '2025-10-25',
    time: '16:00',
    location: 'Phoenix Market City, Viman Nagar, Pune',
    price: 1499,
    capacity: 300,
    availableSeats: 150,
    imageUrl: 'images/gallary-exhibition.jpg',
    category: 'Food'
  },
  {
    title: 'Contemporary Art Exhibition',
    description: 'Explore stunning artworks by renowned artists from Pune and across India in this contemporary art showcase.',
    date: '2025-11-01',
    time: '11:00',
    location: 'ISKON NVCC, Katraj, Pune',
    price: 999,
    capacity: 200,
    availableSeats: 180,
    imageUrl: 'images/art-exhibition.jpg',
    category: 'Arts'
  },
  {
    title: 'Pune Premier League',
    description: 'Experience the excitement of Pune\'s biggest sports tournament featuring local teams competing across multiple sports.',
    date: '2025-11-05',
    time: '15:30',
    location: 'Balewadi Sports Complex, Pune',
    price: 1499,
    capacity: 800,
    availableSeats: 500,
    imageUrl: 'images/sports-event.jpg',
    category: 'Sports'
  },
  {
    title: 'Startup Pitch Day',
    description: 'Watch promising startups present their innovative ideas to investors and industry experts.',
    date: '2025-11-10',
    time: '10:00',
    location: 'Koregaon Park, Pune',
    price: 999,
    capacity: 150,
    availableSeats: 120,
    imageUrl: 'images/startup-event.jpg',
    category: 'Technology'
  },
  {
    title: 'Classical Dance Recital',
    description: 'An evening of traditional Indian classical dance performances by renowned artists.',
    date: '2025-11-15',
    time: '19:00',
    location: 'Tilak Smarak Mandir, Pune',
    price: 1999,
    capacity: 400,
    availableSeats: 300,
    imageUrl: 'images/dance-recital.jpg',
    category: 'Arts'
  },
  {
    title: 'Wine Tasting Experience',
    description: 'Sample the finest wines from Maharashtra vineyards with expert sommeliers.',
    date: '2025-11-20',
    time: '18:00',
    location: 'Sula Vineyards, Nashik (Day trip from Pune)',
    price: 3499,
    capacity: 50,
    availableSeats: 35,
    imageUrl: 'images/wine-tasting.jpg',
    category: 'Food'
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Event.deleteMany({});
    await Ticket.deleteMany({});

    // Create users
    console.log('👤 Creating users...');
    const createdUsers = [];
    
    for (let userData of sampleUsers) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      
      const savedUser = await user.save();
      createdUsers.push(savedUser);
      console.log(`   ✅ Created user: ${userData.name} (${userData.email})`);
    }

    // Create events
    console.log('🎟️ Creating events...');
    const createdEvents = [];
    
    for (let eventData of sampleEvents) {
      const event = new Event({
        ...eventData,
        createdBy: createdUsers[Math.floor(Math.random() * createdUsers.length)]._id
      });
      
      const savedEvent = await event.save();
      createdEvents.push(savedEvent);
      console.log(`   ✅ Created event: ${eventData.title}`);
    }

    // Create sample tickets
    console.log('🎫 Creating sample tickets...');
    
    for (let i = 0; i < 5; i++) {
      const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      const randomEvent = createdEvents[Math.floor(Math.random() * createdEvents.length)];
      const ticketCount = Math.floor(Math.random() * 3) + 1; // 1-3 tickets
      
      // Only create ticket if event has available seats
      if (randomEvent.availableSeats >= ticketCount) {
        const ticket = new Ticket({
          event: randomEvent._id,
          user: randomUser._id,
          userEmail: randomUser.email,
          ticketCount: ticketCount,
          totalPrice: randomEvent.price * ticketCount,
          paymentMethod: ['card_credit', 'card_debit', 'upi', 'wallet'][Math.floor(Math.random() * 4)],
          paymentStatus: 'completed'
        });
        
        await ticket.save();
        
        // Update available seats
        randomEvent.availableSeats -= ticketCount;
        await randomEvent.save();
        
        console.log(`   ✅ Created ticket: ${ticketCount} tickets for ${randomEvent.title} by ${randomUser.name}`);
      }
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log(`👤 Created ${createdUsers.length} users`);
    console.log(`🎟️ Created ${createdEvents.length} events`);
    console.log('📧 Login credentials:');
    console.log('   - rushi@gmail.com / 123456');
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the seeder
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
