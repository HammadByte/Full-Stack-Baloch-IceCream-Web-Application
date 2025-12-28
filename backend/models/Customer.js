import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true, // This creates an index automatically
        match: [/^03\d{9}$/, 'Please add a valid phone number (03XXXXXXXXX)']
    },
    email: {
        type: String,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
    },
    address: {
        street: {
            type: String,
            maxlength: [200, 'Street address too long']
        },
        area: {
            type: String,
            maxlength: [100, 'Area name too long']
        },
        city: {
            type: String,
            default: 'Karachi',
            maxlength: [50, 'City name too long']
        }
    },
    totalOrders: {
        type: Number,
        default: 0
    },
    totalSpent: {
        type: Number,
        default: 0,
        min: 0
    },
    favoriteItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem'
    }],
    preferences: {
        spicyLevel: {
            type: String,
            enum: ['mild', 'medium', 'spicy', 'extra-spicy'],
            default: 'medium'
        },
        specialInstructions: {
            type: String,
            maxlength: [200, 'Special instructions too long']
        }
    },
    lastOrderDate: Date,
    isRegular: {
        type: Boolean,
        default: false
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// REMOVE DUPLICATE INDEX
// customerSchema.index({ phone: 1 }); // ❌ REMOVE THIS LINE

// Keep these indexes - they're not duplicates
customerSchema.index({ totalSpent: -1 });
customerSchema.index({ createdAt: -1 });

// ... rest of the code remains same
customerSchema.virtual('customerSinceDays').get(function() {
    const diffTime = Math.abs(new Date() - this.createdAt);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

customerSchema.virtual('averageOrderValue').get(function() {
    return this.totalOrders > 0 ? this.totalSpent / this.totalOrders : 0;
});

customerSchema.methods.updateOrderStats = async function(orderAmount) {
    this.totalOrders += 1;
    this.totalSpent += orderAmount;
    this.lastOrderDate = new Date();
    
    if (this.totalOrders >= 5) {
        this.isRegular = true;
    }
    
    return await this.save();
};

customerSchema.statics.findOrCreate = async function(phone, customerData) {
    let customer = await this.findOne({ phone });
    
    if (!customer) {
        customer = await this.create({
            phone,
            name: customerData.name,
            email: customerData.email,
            address: customerData.address
        });
    }
    
    return customer;
};

customerSchema.statics.getTopCustomers = async function(limit = 10) {
    return await this.find()
        .sort({ totalSpent: -1, totalOrders: -1 })
        .limit(limit)
        .select('name phone totalOrders totalSpent lastOrderDate isRegular');
};

export default mongoose.model('Customer', customerSchema);