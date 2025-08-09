import mongoose, { Schema, Document } from 'mongoose'

export interface IQueue extends Document {
  patientId: mongoose.Types.ObjectId
  doctorId: mongoose.Types.ObjectId
  queueNumber: number
  priority: 'normal' | 'high' | 'urgent'
  status: 'waiting' | 'in-progress' | 'completed' | 'cancelled'
  reason?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const QueueSchema = new Schema<IQueue>({
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
  queueNumber: {
    type: Number,
    required: true
  },
  priority: {
    type: String,
    enum: ['normal', 'high', 'urgent'],
    default: 'normal'
  },
  status: {
    type: String,
    enum: ['waiting', 'in-progress', 'completed', 'cancelled'],
    default: 'waiting'
  },
  reason: {
    type: String,
    trim: true
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

QueueSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

export default mongoose.models.Queue || mongoose.model<IQueue>('Queue', QueueSchema)
