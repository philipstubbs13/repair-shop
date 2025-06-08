/* eslint-disable @typescript-eslint/no-explicit-any */
import { tickets } from "@/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const insertTicketSchema = createInsertSchema(tickets, {
  id: (schema) =>
    schema.refine(
      (value) => typeof value === "number" || value === "(New)",
      "ID must be a number or '(New)'"
    ),
  title: (schema) => schema.min(1, "Title is required"),
  description: (schema) => schema.min(1, "Description is required"),
  tech: (schema) => schema.email("Invalid email address"),
});

export const selectTicketSchema = createSelectSchema(tickets);

// export type insertTicketSchemaType = typeof insertTicketSchema.type;
export type insertTicketSchemaType = any;

// export type selectTicketSchemaType = typeof selectTicketSchema.type;
export type selectTicketSchemaType = any;
