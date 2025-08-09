import mongoose, { Schema, Document } from 'mongoose'

export interface IAppointment extends Document {
  patientId: mongoose.Types.ObjectId
  doctorId: mongoose.Types.ObjectId
  date: Date
  time: string
  status: 'booked' | 'completed' | 'canceled'
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const AppointmentSchema = new Schema<IAppointment>({
  patientId: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctorId: {
    type: Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['booked', 'completed', 'canceled'],
    default: 'booked'
  },
  notes: {
    type: String,
    trim: true
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

AppointmentSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Compound index to prevent double booking
AppointmentSchema.index({ doctorId: 1, date: 1, time: 1 }, { unique: true })

export default mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema)
