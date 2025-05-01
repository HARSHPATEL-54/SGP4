import mongoose from 'mongoose';
import { Restaurant } from '../models/restaurant.model';
import { Menu } from '../models/menu.model';
import { User } from '../models/user.model';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Connection URI
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/food_app';

// User data - based on real data from the database
const userData = [
  {
    fullname: 'Admin User',
    email: 'admin@foodista.com',
    password: '$2b$10$DAUmStpPEwY9iWZQCdKR7e2bKiUPLGTYYmXGvrRVaAZfTA9.WLqKG', // hashed 'password123'
    contact: 9876543210,
    address: 'NITK Main Building',
    city: 'Mangalore',
    country: 'India',
    profilePicture: 'https://res.cloudinary.com/daqwrdndy/image/upload/v1745349839/default_admin_profile.jpg',
    admin: true,
    isVerified: true,
    authProvider: 'local'
  },
  {
    fullname: 'Anuj',
    email: 'employee@gmail.com',
    password: '$2b$10$UhiHC3dpwKWUSXGNzF99peJSvCo1UdV2aMHBoiMv0kanQdWQds5xG',
    contact: 9312387632,
    address: 'Borivali',
    city: 'Mumbai',
    country: 'India',
    profilePicture: 'https://res.cloudinary.com/daqwrdndy/image/upload/v1745349839/sq7nzac2pwmp2y5auehm.jpg',
    admin: false,
    isVerified: true,
    authProvider: 'local'
  },
  {
    fullname: 'Aart',
    email: 'aart@gmail.com',
    password: '$2b$10$LUAnNTHCfahF9/X5NUYuB.H5owJYOa30wBuHawGii0P73ZCx.lWr2',
    contact: 9313055947,
    address: 'Thane',
    city: 'Mumbai',
    country: 'India',
    profilePicture: 'https://res.cloudinary.com/daqwrdndy/image/upload/v1743214060/zakuifuyrworv6ga3ra5.jpg',
    admin: true,
    isVerified: true,
    authProvider: 'local'
  }
];

// Restaurant data - based on real data from the database
const restaurantData = [
  {
    restaurantName: 'Pizza Station',
    city: 'Anand',
    country: 'India',
    deliveryTime: 30,
    cuisines: ['Italian', 'Mexican', 'Fast Food'],
    imageUrl: 'https://res.cloudinary.com/daqwrdndy/image/upload/v1741637916/wv04qtzo6exig1m1bhyl.png'
  },
  {
    restaurantName: 'Burger King',
    city: 'Mumbai',
    country: 'India',
    deliveryTime: 25,
    cuisines: ['American', 'Fast Food', 'Burgers'],
    imageUrl: 'https://res.cloudinary.com/daqwrdndy/image/upload/v1742272932/h9adoyowpo9knou96u4y.png'
  },
  {
    restaurantName: 'Biryani House',
    city: 'Hyderabad',
    country: 'India',
    deliveryTime: 40,
    cuisines: ['Indian', 'Mughlai', 'Biryani'],
    imageUrl: 'https://res.cloudinary.com/daqwrdndy/image/upload/v1741637916/biryani_house_image.jpg'
  }
];

// Menu data - based on real data from the database
const pizzaStationMenuData = [
  {
    name: 'Farm Villa Pizza',
    description: "a pizza that includes capsicum, tomatoes, paneer, and red paprika. It's topped with cheese dip",
    price: 200,
    image: 'https://res.cloudinary.com/daqwrdndy/image/upload/v1741665328/p3wexaklfzq0xhoc663z.png'
  },
  {
    name: 'Jalebi',
    description: 'treat made by piping spirals of slightly fermented batter into hot oil, and then soaking the whorls in warm sugar syrup',
    price: 45,
    image: 'https://res.cloudinary.com/daqwrdndy/image/upload/v1741668309/oxwr2dr4nvafnraq4bsv.jpg'
  },
  {
    name: 'Chocolate Brownie',
    description: 'A chocolate brownie, or simply a brownie, is a chocolate baked dessert bar.',
    price: 70,
    image: 'https://res.cloudinary.com/daqwrdndy/image/upload/v1741668606/w5wuymrn5pg4lw2pp1bw.jpg'
  },
  {
    name: 'Margherita Pizza',
    description: 'Classic cheese pizza with tomato sauce and fresh basil',
    price: 299,
    image: 'https://res.cloudinary.com/daqwrdndy/image/upload/v1713329638/menu/margherita_pizza.jpg'
  }
];

const burgerKingMenuData = [
  {
    name: 'Crispy Veg',
    description: "A crispy, spiced vegetable patty with onions and Burger King's signature tomato herby sauce, all served on a bun",
    price: 70,
    image: 'https://res.cloudinary.com/daqwrdndy/image/upload/v1742273183/ccaxdrx4chsswmvl3a3x.jpg'
  },
  {
    name: 'Coke',
    description: 'Coke is offered as a standard, iconic carbonated soft drink.',
    price: 50,
    image: 'https://res.cloudinary.com/daqwrdndy/image/upload/v1742273262/mhirulegdeeylarugssj.jpg'
  },
  {
    name: 'Chocolate Sundae',
    description: 'a vanilla soft serve ice cream smothered in a chocolaty topping sauce',
    price: 80,
    image: 'https://res.cloudinary.com/daqwrdndy/image/upload/v1742273364/hfo4czwn54jh8utauahb.jpg'
  },
  {
    name: 'Veg Whopper',
    description: 'A flame-grilled patty, topped with fresh tomatoes, lettuce, mayonnaise, ketchup, pickles, and sliced white onions, all served on a toasted sesame seed bun',
    price: 180,
    image: 'https://res.cloudinary.com/daqwrdndy/image/upload/v1742273803/qzfzjn5ghohoqccwe5m1.jpg'
  }
];

const biryaniHouseMenuData = [
  {
    name: 'Chicken Biryani',
    description: 'Fragrant basmati rice cooked with tender chicken pieces, aromatic spices, and fresh herbs',
    price: 250,
    image: 'https://res.cloudinary.com/daqwrdndy/image/upload/v1741665328/chicken_biryani.jpg'
  },
  {
    name: 'Veg Biryani',
    description: 'Aromatic rice dish made with mixed vegetables, basmati rice, and traditional spices',
    price: 200,
    image: 'https://res.cloudinary.com/daqwrdndy/image/upload/v1741665328/veg_biryani.jpg'
  },
  {
    name: 'Hyderabadi Biryani',
    description: 'A special biryani from Hyderabad with rich flavors, served with raita and salan',
    price: 300,
    image: 'https://res.cloudinary.com/daqwrdndy/image/upload/v1741665328/hyderabadi_biryani.jpg'
  },
  {
    name: 'Gulab Jamun',
    description: 'Soft milk solids balls soaked in rose-flavored sugar syrup, a classic Indian dessert',
    price: 60,
    image: 'https://res.cloudinary.com/daqwrdndy/image/upload/v1741665328/gulab_jamun.jpg'
  }
];

// Seed function
async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully.');

    // Clear existing data
    await User.deleteMany({});
    await Restaurant.deleteMany({});
    await Menu.deleteMany({});

    console.log('Cleared existing data.');

    // Create users
    const createdUsers = [];
    for (const user of userData) {
      const newUser = await User.create(user);
      createdUsers.push(newUser);
      console.log('Created user:', newUser.email);
    }

    // Admin user is the first one
    const adminUser = createdUsers[0];

    // Create restaurants
    const restaurants = [];
    for (const restaurant of restaurantData) {
      const newRestaurant = await Restaurant.create({
        ...restaurant,
        user: adminUser._id
      });
      restaurants.push(newRestaurant);
      console.log('Created restaurant:', newRestaurant.restaurantName);
    }

    // Create menu items for Pizza Station
    const pizzaStationMenus = [];
    for (const menu of pizzaStationMenuData) {
      const newMenu = await Menu.create(menu);
      pizzaStationMenus.push(newMenu._id);
      console.log('Created menu item for Pizza Station:', newMenu.name);
    }

    // Create menu items for Burger King
    const burgerKingMenus = [];
    for (const menu of burgerKingMenuData) {
      const newMenu = await Menu.create(menu);
      burgerKingMenus.push(newMenu._id);
      console.log('Created menu item for Burger King:', newMenu.name);
    }
    
    // Create menu items for Biryani House
    const biryaniHouseMenus = [];
    for (const menu of biryaniHouseMenuData) {
      const newMenu = await Menu.create(menu);
      biryaniHouseMenus.push(newMenu._id);
      console.log('Created menu item for Biryani House:', newMenu.name);
    }

    // Update restaurants with menu references
    await Restaurant.findByIdAndUpdate(restaurants[0]._id, {
      menus: pizzaStationMenus
    });
    
    await Restaurant.findByIdAndUpdate(restaurants[1]._id, {
      menus: burgerKingMenus
    });
    
    await Restaurant.findByIdAndUpdate(restaurants[2]._id, {
      menus: biryaniHouseMenus
    });

    console.log('Updated restaurants with menu references.');
    console.log('Database seeding completed successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedDatabase().catch(console.error);
}

export { seedDatabase };
