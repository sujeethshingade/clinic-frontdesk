import mongoose, { Schema, Document } from 'mongoose'

interface ContactInfo {
  phone: string
  email?: string
  address?: string
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
}

export interface IPatient extends Document {
  fullName: string
  contactInfo: ContactInfo
  medicalNotes?: string
  dateOfBirth?: Date
  gender?: 'male' | 'female' | 'other'
  createdAt: Date
  updatedAt: Date
}

const ContactInfoSchema = new Schema({
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  address: {
    type: String,
    trim: true
  },
  emergencyContact: {
    name: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    relationship: {
      type: String,
      trim: true
    }
  }
})

const PatientSchema = new Schema<IPatient>({
  fullName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  contactInfo: {
    type: ContactInfoSchema,
    required: true
  },
  medicalNotes: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
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

PatientSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

export default mongoose.models.Patient || mongoose.model<IPatient>('Patient', PatientSchema)
