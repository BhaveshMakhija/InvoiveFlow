import express from "express";
import {clearkMiddleware} from "@clerk/express";
import {getInvoices} from "../controllers/invoiceController.js";


const invoiceRouter = express.Router();

invoiceRouter.use(clearkMiddleware());

incoiceRouter.get("/", getInvoices);
invoiceRouter.get("/:id", getInvoiceById);
invoiceRouter.post("/", createInvoice);
invoiceRouter.put("/:id", updateInvoice);
invoiceRouter.delete("/:id", deleteInvoice);


export default invoiceRouter;