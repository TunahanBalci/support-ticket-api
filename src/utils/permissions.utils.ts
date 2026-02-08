import type { Tickets } from "../generated/prisma/client";

/*
@param userId - string
@param role - string
@param ticket - Tickets

@description Checks if a user can access a ticket based on their role and the ticket's ownership.
SUPPORT_AGENT can access all tickets, while regular users can only access their own, non-deleted tickets.
*/
async function canAccessTicket(userId: string, role: string, ticket: Tickets) {
  if (role === "SUPPORT_AGENT") {
    return true;
  }
  if (ticket.userId === userId && ticket.deletedAt === null) {
    return true;
  }
  return false;
}

/*
@param userIdFromPayload - string
@param userIdFromRequest - string
@param role - string

@description Checks if a user can view their own tickets based on their role and the userId.
SUPPORT_AGENT can view all tickets, while regular users can only view their own tickets
*/
async function canViewUserTickets(userIdFromPayload: string, userIdFromRequest: string, role: string) {
  if (role === "SUPPORT_AGENT") {
    return true;
  }
  if (userIdFromPayload === userIdFromRequest) {
    return true;
  }
  return false;
}

/*
@param role - string

@description Checks if a user can view all tickets based on their role. Only SUPPORT_AGENT can view all tickets
*/
async function canViewAllTickets(role: string) {
  return role === "SUPPORT_AGENT";
}

/*
@param userId - string
@param role - string
@param ticket - Tickets

@description Checks if a user can access a message based on their role and the ticket's ownership.
SUPPORT_AGENT can access all messages, while regular users can only access messages of their own, non-deleted tickets.
*/
async function canAccessMessage(role: string, _userId: string, ticket: Tickets) {
  if (role === "SUPPORT_AGENT") {
    return true;
  }
  if (ticket.userId === _userId && ticket.deletedAt === null) {
    return true;
  }
  return false;
}

/*
@param role - string

@description Checks if a user can view all messages based on their role. Only SUPPORT_AGENT can view all messages
*/
async function canViewAllMessages(role: string) {
  return role === "SUPPORT_AGENT";
}

export { canAccessMessage, canAccessTicket, canViewAllMessages, canViewAllTickets, canViewUserTickets };
