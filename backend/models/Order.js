import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1'],
        max: [50, 'Quantity cannot exceed 50']
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    specialInstructions: {
        type: String,
        maxlength: [200, 'Special instructions too long'],
        default: ''
    }
});

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true // This creates an index automatically
    },
    customer: {
        name: {
            type: String,
            required: [true, 'Customer name is required'],
            trim: true,
            maxlength: [100, 'Name too long']
        },
        phone: {
            type: String,
            required: [true, 'Customer phone is required'],
            match: [/^03\d{9}$/, 'Please add a valid phone number']
        },
        address: {
            type: String,
            required: function() { return this.orderType === 'delivery'; }
        }
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true,
        min: 0,
        set: v => Math.round(v * 100) / 100
    },
    orderType: {
        type: String,
        enum: {
            values: ['dine-in', 'takeaway', 'delivery'],
            message: 'Order type must be dine-in, takeaway, or delivery'
        },
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'online'],
        default: 'cash'
    },
    preparationTime: {
        type: Number, // in minutes
        min: 1,
        default: 15
    },
    specialInstructions: {
        type: String,
        maxlength: [500, 'Special instructions too long'],
        default: ''
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    completedAt: Date
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// REMOVE DUPLICATE INDEXES
// orderSchema.index({ orderNumber: 1 }); // ❌ REMOVE THIS LINE

// Keep these indexes - they're not duplicates
orderSchema.index({ status: 1 });
orderSchema.index({ 'customer.phone': 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ orderType: 1, status: 1 });

// ... rest of the code remains same
orderSchema.pre('save', async function(next) {
    if (this.isNew && !this.orderNumber) {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        this.orderNumber = `BAL${timestamp}${random}`;
    }
    next();
});

orderSchema.virtual('estimatedCompletion').get(function() {
    if (this.status === 'completed' && this.completedAt) {
        return this.completedAt;
    }
    
    const completionTime = new Date(this.createdAt);
    completionTime.setMinutes(completionTime.getMinutes() + this.preparationTime);
    return completionTime;
});

orderSchema.virtual('summary').get(function() {
    return {
        orderNumber: this.orderNumber,
        customerName: this.customer.name,
        totalAmount: this.totalAmount,
        status: this.status,
        itemCount: this.items.reduce((sum, item) => sum + item.quantity, 0)
    };
});

orderSchema.statics.getByStatus = async function(status) {
    return await this.find({ status })
        .populate('items.menuItem', 'name price category')
        .populate('assignedTo', 'name')
        .sort({ createdAt: -1 });
};

orderSchema.methods.updateStatus = async function(newStatus) {
    this.status = newStatus;
    
    if (newStatus === 'completed') {
        this.completedAt = new Date();
    }
    
    return await this.save();
};

orderSchema.statics.getTodaysOrders = async function() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    
    return await this.find({
        createdAt: { $gte: startOfDay, $lte: endOfDay }
    });
};

export default mongoose.model('Order', orderSchema);