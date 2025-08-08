import mongoose from "mongoose";

const TokenSchema = new mongoose.Schema({
    team_id:{
        type: String,
        required: true,
        unique: true
    },
    access_token:{
        type: String,
        required: true
    },
    refresh_token:{
        type:String,
        required:true,
    },
    expires_at: {
        type: Date,
        required: true,
        validate: {
            validator: function(date: Date) {
                return date instanceof Date && !isNaN(date.getTime());
            },
            message: 'expires_at must be a valid date'
        }
    }

});

TokenSchema.pre('save', function(next) {
    if (this.isModified('expires_at')) {
        if (!this.expires_at || isNaN(this.expires_at.getTime())) {
            const error = new Error('Invalid expires_at date provided');
            return next(error);
        }
    }
    next();
});

TokenSchema.pre('findOneAndUpdate', function(next) {
    const update = this.getUpdate() as any;
    if (update && update.expires_at) {
        const expiresAt = new Date(update.expires_at);
        if (isNaN(expiresAt.getTime())) {
            const error = new Error('Invalid expires_at date provided in update');
            return next(error);
        }
        update.expires_at = expiresAt;
    }
    next();
});

export const TokenModel = mongoose.model("Token", TokenSchema);
