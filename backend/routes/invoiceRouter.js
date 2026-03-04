import express from "express";
import { clerkMiddleware } from "@clerk/express";
import {
    listInvoices,
    getInvoiceById,
    createInvoice,
    updateInvoice,
    deleteInvoice,
} from "../controllers/invoiceController.js";

const invoiceRouter = express.Router();

invoiceRouter.use(clerkMiddleware());

invoiceRouter.get("/", listInvoices);
invoiceRouter.get("/:id", getInvoiceById);
invoiceRouter.post("/", createInvoice);
invoiceRouter.put("/:id", updateInvoice);
invoiceRouter.delete("/:id", deleteInvoice);

export default invoiceRouter;