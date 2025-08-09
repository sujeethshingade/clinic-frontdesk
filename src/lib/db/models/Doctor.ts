import mongoose, { Schema, Document } from 'mongoose'

export interface IDoctor extends Document {
  firstName: string
  lastName: string
  email: string
  specialization: string
  licenseNumber: string
  phone: string
  qualifications: string[]
  experience: number
  consultationFee: number
  status: 'active' | 'inactive'
  createdAt: Date
  updatedAt: Date
}

const DoctorSchema = new Schema<IDoctor>({
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  specialization: {
    type: String,
    required: true,
    trim: true
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  qualifications: [{
    type: String,
    trim: true
  }],
  experience: {
    type: Number,
    default: 0,
    min: 0
  },
  consultationFee: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

DoctorSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

export default mongoose.models.Doctor || mongoose.model<IDoctor>('Doctor', DoctorSchema)
