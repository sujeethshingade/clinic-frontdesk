import mongoose, { Schema, Document } from 'mongoose'

interface AvailabilitySlot {
  date: Date
  slots: string[]
}

export interface IDoctor extends Document {
  name: string
  specialization: string
  gender: 'male' | 'female' | 'other'
  location: string
  availability: AvailabilitySlot[]
  phone?: string
  email?: string
  createdAt: Date
  updatedAt: Date
}

const AvailabilitySlotSchema = new Schema({
  date: {
    type: Date,
    required: true
  },
  slots: [{
    type: String,
    required: true
  }]
})

const DoctorSchema = new Schema<IDoctor>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  specialization: {
    type: String,
    required: true,
    trim: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  availability: [AvailabilitySlotSchema],
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
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
