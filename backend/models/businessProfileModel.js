import mongoose from "mongoose";


const BusinessProfileSchema = new mongoose.Schema({
    owner: { type: String, required: true, index: true },
    businessName: { type: String, required: true }, 
    email: { type: String, required: true, trim: true, lowercase: true, default: "" },
    phone: { type: String, required: true, default: "" },
    address: { type: String, required: true, default: "" },
    gst: { type: String, required: true, default: "" },

    //for images 
    logoUrl: { type: String,required: true, default: null },
    stampUrl: { type: String, required: true, default: null },
    signatureurl: { type: String, required: true, default: null },

    signatureOwnername: { type: String, required: true, default: "" },
    signatureOwnerTitle: { type: String, required: true, default: "" },

    defaultTaxPercent: { type: Number, required: true, default: 0 }
}, { timestamps: true }); 

const BusinessProfile = mongoose.model.BusinessProfile || mongoose.model("BusinessProfile", BusinessProfileSchema);

export default BusinessProfile;