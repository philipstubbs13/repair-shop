"use server";

import { flattenValidationErrors } from "next-safe-action";
import { redirect } from "next/navigation";

import { actionClient } from "@/lib/safe-action";

import { db } from "@/db";
import { tickets } from "@/db/schema";
import {
  insertTicketSchema,
  insertTicketSchemaType,
} from "@/zod-schemas/ticket";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { eq } from "drizzle-orm";

export const saveTicketAction = actionClient
  .metadata({ actionName: "saveTicketAction" })
  .schema(insertTicketSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(
    async ({
      parsedInput: ticket,
    }: {
      parsedInput: insertTicketSchemaType;
    }) => {
      const { isAuthenticated } = getKindeServerSession();

      const isAuth = await isAuthenticated();

      if (!isAuth) redirect("/login");

      // New ticket
      if (ticket.id === "(New)") {
        const result = await db
          .insert(tickets)
          .values({
            customerId: ticket.customerId,
            title: ticket.title,
            description: ticket.description,
            tech: ticket.tech,
          })
          .returning({ insertedId: tickets.id });

        return {
          message: `Ticket ID #${result[0].insertedId} created successfully`,
        };
      }

      // Updating ticket
      const result = await db
        .update(tickets)
        .set({
          customerId: ticket.customerId,
          title: ticket.title,
          description: ticket.description,
          completed: ticket.completed,
          tech: ticket.tech,
        })
        .where(eq(tickets.id, ticket.id!))
        .returning({ updatedId: tickets.id });

      return {
        message: `Ticket ID #${result[0].updatedId} updated successfully`,
      };
    }
  );
