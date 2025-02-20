import mongoose, {Schema, model} from 'mongoose';

const activitySchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    action: {type: String, required: true},
    timestamp: {type: Date, default: Date.now},
    metadata: {type: Schema.Types.Mixed}
})

export default model('Activity', activitySchema)