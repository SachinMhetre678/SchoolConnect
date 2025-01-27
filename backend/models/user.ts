import mongoose, { Document } from "mongoose";

interface IUser extends Document {
    name: string;
    age: number;
    role: string;
    batch?: string;
    phone: string;
    emergencyContact?: string;
    address: string;
    avatar: Buffer;
    
    // New profile-related fields
    grade?: string;
    guardianName?: string;
    bloodGroup?: string;
    studentId?: string;
    joinDate?: Date;
}

const userSchema = new mongoose.Schema<IUser>({
    name: {
        type: String,
        required: [true, "Please enter your name"],
        unique: true,
    },
    age: {
        type: Number,
        required: [true, "Please enter your age"],
    },
    role: {
        type: String,
        enum: ["Student", "Teacher", "Intern"],
        required: true,
    },
    batch: {
        type: String,
        enum: ["morning", "afternoon", "Both"],
        required: function (this: IUser) {
            return this.role === "Student";
        },
    },
    phone: {
        type: String,
        required: [true, "Please enter your phone number"],
    },
    emergencyContact: {
        type: String,
    },
    address: {
        type: String,
        required: [true, "Please enter your address"],
    },
    avatar : {
        type: 'Buffer',
        public_id: String,
        url: String, 
    },
    grade: {
        type: String,
        required: false
    },
    guardianName: {
        type: String,
        required: false
    },
    bloodGroup: {
        type: String,
        required: false
    },
    studentId: {
        type: String,
        unique: true,
        required: false
    },
    joinDate: {
        type: Date,
        required: false,
        default: Date.now
    }
});

export default mongoose.model<IUser>("User", userSchema);
