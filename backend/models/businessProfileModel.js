import mongoose from "mongoose";


const BusinessProfileSchema = new mongoose.Schema({
    owner: { type: String, required: true, index: true },
    businessName: { type: String, required: true },
    email: { type: String, trim: true, lowercase: true, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    gst: { type: String, default: "" },

    //for images 
    logoUrl: { type: String, default: null },
    stampUrl: { type: String, default: null },
    signatureUrl: { type: String, default: null },

    signatureOwnerName: { type: String, default: "" },
    signatureOwnerTitle: { type: String, default: "" },

    defaultTaxPercent: { type: Number, default: 0 }
}, { timestamps: true });

const BusinessProfile = mongoose.model.BusinessProfile || mongoose.model("BusinessProfile", BusinessProfileSchema);

export default BusinessProfile;