import mongoose, { Schema, Document } from 'mongoose'

export interface IQueue extends Document {
  patientId: mongoose.Types.ObjectId
  queueNumber: number
  arrivalTime: Date
  estimatedWait: number // in minutes
  status: 'waiting' | 'with-doctor' | 'completed'
  priority: 'normal' | 'urgent'
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
  queueNumber: {
    type: Number,
    required: true,
    unique: true
  },
  arrivalTime: {
    type: Date,
    default: Date.now
  },
  estimatedWait: {
    type: Number,
    default: 15
  },
  status: {
    type: String,
    enum: ['waiting', 'with-doctor', 'completed'],
    default: 'waiting'
  },
  priority: {
    type: String,
    enum: ['normal', 'urgent'],
    default: 'normal'
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

QueueSchema.pre('save', async function(next) {
  if (this.isNew) {
    const lastQueue = await mongoose.model('Queue').findOne().sort({ queueNumber: -1 })
    this.queueNumber = lastQueue ? lastQueue.queueNumber + 1 : 1
  }
  next()
})

export default mongoose.models.Queue || mongoose.model<IQueue>('Queue', QueueSchema)
