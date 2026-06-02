import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Standard, robust email regex pattern
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Define the User schema with fields for email, name, and password, including validation and security measures
const userSchema = new mongoose.Schema({
    // Define the email field with validation and uniqueness constraints
    email: {
        type: String,
        required: [true, 'Email is required to create an account.'],
        trim: true,
        unique: [true, 'This email is already registered. Please use a different email address.'],
        lowercase: true,
        match: [emailRegex, 'Please enter a valid email address.']
    },

    // Define the name field with validation
    name: {
        type: String,
        required: [true, 'Name is required to create an account.'],
        trim: true
    },

    // Define the password field with validation and security considerations
    password: {
        type: String,
        required: [true, 'Password is required to create an account.'],
        minlength: [6, 'Password must be at least 6 characters long.'],
        select: false // Exclude password from query results by default
    },

    // Define a field to indicate if the user is a system user (e.g., admin), with immutability to prevent changes after creation
    systemUser: {
        type: Boolean,
        default: false, // Indicates if the user is a system user (e.g., admin)
        immutable: true, // Prevent changes to this field after creation
        select: false // Exclude systemUser from query results by default for security reasons
    }
}, {
    timestamps: true // Automatically add createdAt and updatedAt fields
});

userSchema.pre('save', async function () {
    // Hash the password before saving
    if (!this.isModified('password')) return; // Only hash if the password has been modified (or is new)
    this.password = await bcrypt.hash(this.password, 12);
    return;
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    // Compare the provided password with the hashed password in the database
    return await bcrypt.compare(candidatePassword, this.password);
}

// Create and export the User model based on the defined schema
const userModel = mongoose.model('user', userSchema);
export default userModel;
