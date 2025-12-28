import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import MenuItem from '../models/MenuItem.js';
import connectDB from '../config/database.js';

dotenv.config();

const sampleMenuItems = [
    // Ice Creams
    {
        name: "Kulfa Falooda",
        description: "Traditional kulfi with falooda noodles, rose syrup, and nuts",
        price: 450,
        category: "icecream",
        ingredients: ["Kulfi", "Falooda", "Rose Syrup", "Pistachios", "Almonds"],
        preparationTime: 8,
        tags: ["popular", "traditional", "sweet"]
    },
    {
        name: "Chocolate Sundae",
        description: "Rich chocolate ice cream with hot fudge and whipped cream",
        price: 350,
        category: "icecream",
        ingredients: ["Chocolate Ice Cream", "Hot Fudge", "Whipped Cream", "Cherry"],
        preparationTime: 5,
        tags: ["chocolate", "popular"]
    },
    {
        name: "Mango Mastani",
        description: "Fresh mango ice cream with mango pieces and cream",
        price: 400,
        category: "icecream",
        ingredients: ["Mango Ice Cream", "Fresh Mango", "Cream", "Sugar Syrup"],
        preparationTime: 6,
        tags: ["mango", "seasonal"]
    },

    // Rolls
    {
        name: "Chicken Tikka Roll",
        description: "Spicy chicken tikka wrapped in paratha with sauces",
        price: 280,
        category: "roll",
        ingredients: ["Chicken Tikka", "Paratha", "Mayonnaise", "Chatni", "Vegetables"],
        preparationTime: 12,
        spicyLevel: "medium",
        tags: ["spicy", "popular", "non-veg"]
    },
    {
        name: "Beef Boti Roll",
        description: "Juicy beef boti pieces in soft paratha",
        price: 320,
        category: "roll",
        ingredients: ["Beef Boti", "Paratha", "Yogurt Sauce", "Onions", "Spices"],
        preparationTime: 15,
        spicyLevel: "spicy",
        tags: ["spicy", "beef", "non-veg"]
    },
    {
        name: "Vegetable Roll",
        description: "Fresh vegetables with special sauces in paratha",
        price: 180,
        category: "roll",
        ingredients: ["Mixed Vegetables", "Paratha", "Mayonnaise", "Ketchup", "Salad"],
        preparationTime: 10,
        spicyLevel: "mild",
        tags: ["vegetarian", "healthy"]
    },

    // Shakes
    {
        name: "Oreo Shake",
        description: "Creamy milkshake with Oreo cookies and chocolate",
        price: 300,
        category: "shake",
        ingredients: ["Milk", "Oreo Cookies", "Chocolate Syrup", "Ice Cream", "Whipped Cream"],
        preparationTime: 7,
        tags: ["chocolate", "popular", "sweet"]
    },
    {
        name: "Strawberry Shake",
        description: "Fresh strawberry milkshake with real fruit",
        price: 280,
        category: "shake",
        ingredients: ["Milk", "Fresh Strawberries", "Sugar", "Ice Cream", "Strawberry Syrup"],
        preparationTime: 7,
        tags: ["fruit", "refreshing"]
    },

    // Desserts
    {
        name: "Chocolate Brownie",
        description: "Warm chocolate brownie with ice cream",
        price: 220,
        category: "dessert",
        ingredients: ["Chocolate Brownie", "Vanilla Ice Cream", "Chocolate Sauce", "Nuts"],
        preparationTime: 5,
        tags: ["chocolate", "warm", "sweet"]
    },

    // Beverages
    {
        name: "Fresh Lime Soda",
        description: "Refreshing lime soda with mint",
        price: 120,
        category: "beverage",
        ingredients: ["Fresh Lime", "Soda", "Mint", "Sugar", "Salt"],
        preparationTime: 3,
        tags: ["refreshing", "cold", "summer"]
    }
];

const sampleUsers = [
    {
        name: "Admin User",
        email: "admin@balochicecream.com",
        password: "Admin123!",
        phone: "03123456789",
        role: "admin"
    },
    {
        name: "Staff Member",
        email: "staff@balochicecream.com",
        password: "Staff123!",
        phone: "03123456780",
        role: "staff"
    }
];

const seedDatabase = async () => {
    try {
        await connectDB();

        // Clear existing data
        await User.deleteMany();
        await MenuItem.deleteMany();

        console.log('🗑️ Existing data cleared...');

        // Create users
        const createdUsers = await User.create(sampleUsers);
        console.log(`👥 ${createdUsers.length} users created`);

        // Create menu items
        const createdMenuItems = await MenuItem.create(sampleMenuItems);
        console.log(`🍽️ ${createdMenuItems.length} menu items created`);

        console.log('✅ Database seeded successfully!');
        console.log('\n📋 Sample Data Created:');
        console.log('Admin Login: admin@balochicecream.com / Admin123!');
        console.log('Staff Login: staff@balochicecream.com / Staff123!');
        console.log('\n🍦 Menu includes: Kulfa Falooda, Chicken Tikka Roll, Oreo Shake, etc.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await connectDB();

        await User.deleteMany();
        await MenuItem.deleteMany();
        await Order.deleteMany();
        await Customer.deleteMany();

        console.log('🗑️ All data destroyed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Destruction error:', error);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    seedDatabase();
}