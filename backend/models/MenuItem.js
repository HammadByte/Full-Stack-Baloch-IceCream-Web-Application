import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative'],
        set: v => Math.round(v * 100) / 100
    },
    category: {
        type: String,
        enum: {
            values: ['icecream', 'roll', 'shake', 'dessert', 'beverage'],
            message: 'Category is either: icecream, roll, shake, dessert, beverage'
        },
        required: true
    },
    image: {
        type: String,
        default: ''
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    ingredients: [{
        type: String,
        trim: true
    }],
    size: {
        type: String,
        enum: ['small', 'medium', 'large', 'regular'],
        default: 'regular'
    },
    preparationTime: {
        type: Number, // in minutes
        min: [1, 'Preparation time must be at least 1 minute'],
        max: [60, 'Preparation time cannot exceed 60 minutes'],
        default: 10
    },
    spicyLevel: {
        type: String,
        enum: ['mild', 'medium', 'spicy', 'extra-spicy'],
        default: 'medium'
    },
    nutritionalInfo: {
        calories: Number,
        protein: Number,
        carbs: Number,
        fat: Number
    },
    tags: [String]
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// These indexes are fine - no duplicates
menuItemSchema.index({ category: 1, isAvailable: 1 });
menuItemSchema.index({ price: 1 });

// ... rest of the code remains same
menuItemSchema.virtual('formattedPrice').get(function() {
    return `Rs. ${this.price.toFixed(2)}`;
});

menuItemSchema.statics.getByCategory = async function(category) {
    return await this.find({ category, isAvailable: true })
        .sort({ name: 1 })
        .select('name description price image preparationTime');
};

menuItemSchema.methods.toggleAvailability = async function() {
    this.isAvailable = !this.isAvailable;
    return await this.save();
};

export default mongoose.model('MenuItem', menuItemSchema);