import mongoose from "mongoose";


const ItemSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1
    },
    unitPrice: {
        type: Number,
        required: true,
        default: 0
    }
}, { _id: false }
);

//Invoice Schema
const InvoiceSchema = new mongoose.Schema({
    owner: {
        type: String,
        required: true,
        index: true
    }, // coming from clerk id

    //it is unique for each invoice, we can use it to fetch the invoice from the database
    invoiceNumber: {
        type: String,
        required: true,
        index: true
    },
    issueDate: {
        type: String,
        required: true
    },
    dueDate: {
        type: String,
        default: ""
    },

    //for Business details
    fromBusinessName: { type: String, default: "" },
    fromEmail: { type: String, default: "" },
    fromAddress: { type: String, default: "" },
    fromPhone: { type: String, default: "" },
    fromGst: { type: String, default: "" },

    //for Client details
    client: {
        name: { type: String, default: "" },
        email: { type: String, default: "" },
        address: { type: String, default: "" },
        phone: { type: String, default: "" },
    },

    items: { type: [ItemSchema], default: [] },

    currency: { type: String, default: "INR" },
    status: { type: String, enum: ["draft", "unpaid", "paid", "overdue"], default: "draft" },
    notes: { type: String, default: "" },

    //for Asset details
    logoDataUrl: { type: String, default: null },
    stampDataUrl: { type: String, default: null },
    signatureDataUrl: { type: String, default: null },

    signatureName: { type: String, default: "" },
    signatureTitle: { type: String, default: "" },

    taxPercent: { type: Number, default: 18 },

    subtotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, default: 0 },

},
    { timestamps: true }
);

const Invoice = mongoose.model.Invoice || mongoose.model("Invoice", InvoiceSchema);

export default Invoice;