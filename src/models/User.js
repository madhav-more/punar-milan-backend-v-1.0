const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    // Basic Info
    name: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: true
    },
    religion: { type: String, index: true },
    caste: { type: String },
    motherTongue: { type: String },

    // Location
    city: { type: String },
    state: { type: String },
    country: { type: String },

    // Professional
    education: { type: String },
    occupation: { type: String },
    income: { type: String },

    // Personal
    bio: { type: String },
    height: { type: Number }, // in cm
    diet: {
        type: String,
        enum: ['veg', 'non-veg', 'vegan', 'eggetarian']
    },
    smoking: { type: String },
    drinking: { type: String },

    // Media
    profilePhoto: { type: String }, // Cloudinary URL
    gallery: [String],

    // Settings & Privacy
    isPhoneHidden: { type: Boolean, default: false },
    isProfileHidden: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    shortlisted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    profileCompletion: { type: Number, default: 0 },

    // Firebase Token
    fcmToken: { type: String }
}, {
    timestamps: true
});

// Hash password and calculate profile completion before saving
userSchema.pre('save', async function () {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }

    // Calculate completion percentage
    const fields = [
        'religion', 'city', 'state', 'education', 
        'occupation', 'income', 'bio', 'height', 
        'diet', 'profilePhoto'
    ];
    
    let completed = 0;
    fields.forEach(field => {
        if (this[field] && this[field] !== '') {
            completed++;
        }
    });

    // Base completion (registration fields) is fixed at 30%
    // Remaining 70% is distributed among the 10 fields above (7% each)
    this.profileCompletion = 30 + (completed * 7);
});

// Match password method
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
