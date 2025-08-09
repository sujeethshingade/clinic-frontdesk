import mongoose, { Schema, Document } from 'mongoose'

export interface IAppointment extends Document {
  patientId: mongoose.Types.ObjectId
  doctorId: mongoose.Types.ObjectId
  appointmentDate: Date
  appointmentTime: string
  type: 'consultation' | 'follow-up' | 'emergency'
  reason?: string
  notes?: string
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
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
  appointmentDate: {
    type: Date,
    required: true
  },
  appointmentTime: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['consultation', 'follow-up', 'emergency'],
    default: 'consultation'
  },
  reason: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled'],
    default: 'scheduled'
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

AppointmentSchema.index({ doctorId: 1, appointmentDate: 1, appointmentTime: 1 }, { unique: true })

export default mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema)
