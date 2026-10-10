const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ['ADMIN', 'MANUFACTURER', 'DISTRIBUTOR', 'RETAILER', 'CUSTOMER'],
      default: 'CUSTOMER'
    },
    phone: String,
    organization: String,
    address: String,
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    if (typeof next === 'function') return next();
    return;
  }
  this.password = await bcrypt.hash(this.password, 10);
  if (typeof next === 'function') next();
});

userSchema.methods.matchPassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
