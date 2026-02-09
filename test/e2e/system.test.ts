
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../../src/utils/prisma.utils";
import "dotenv/config";

const API_URL = process.env.API_URL || `http://localhost:${process.env.APP_PORT || 8000}/api/v1`;

const TEST_EMAIL = `e2e-${Date.now()}@example.com`;
const TEST_PASSWORD = "Password123!";

describe("E2E System Test", () => {
    let accessToken: string = "";
    let userId: string = "";
    let ticketId: string = "";
    let messageId: string = "";

    beforeAll(async () => {
        await prisma.$connect();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    /**
     * @param email - The email address of the new user
     * @param password - The password for the new user
     * 
     * @description Registers a new user with the provided credentials and verifies the response.
     */
    it("should register a new user", async () => {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
        });
        
        expect(res.status).toBe(201);
        const data = await res.json();
        
        // fetch userId from token
        accessToken = data.data.accessToken;
        expect(accessToken).toBeDefined();
        const payload = JSON.parse(Buffer.from(accessToken.split('.')[1] || '', 'base64').toString());
        userId = payload.userId;
        expect(userId).toBeDefined();
    });

    /**
     * @param email - The email of the registered user
     * @param password - The password of the registered user
     * 
     * @description Logs in the user and retrieves an access token.
     */
    it("should login", async () => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
        });
        
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.data.accessToken).toBeDefined();
        // Update token just in case
        accessToken = data.data.accessToken; 
    });

    /**
     * @param title - The title of the ticket
     * @param description - The description of the ticket
     * 
     * @description Creates a new support ticket. This action should trigger asynchronous jobs for Slack notification and embedding generation.
     */
    it("should create a ticket (triggers Slack & Semantic)", async () => {
        const res = await fetch(`${API_URL}/ticket/create`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify({ title: "E2E Test Ticket", description: "Verification of full system flow." }),
        });

        expect(res.status).toBe(201);
        const data = await res.json();
        ticketId = data.data.id;
        expect(ticketId).toBeDefined();
    });

    /**
     * @param ticketId - The ID of the ticket to verify
     * @param content - The content of the message
     * 
     * @description Creates a new message on the ticket. This action should trigger an asynchronous job for embedding generation.
     */
    it("should create a message (triggers Semantic)", async () => {
        const res = await fetch(`${API_URL}/message/create`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify({ ticketId, content: "This is a test message for e2e." }),
        });

        expect(res.status).toBe(201);
        const data = await res.json();
        messageId = data.data.id;
        expect(messageId).toBeDefined();
    });

    /**
     * @param ticketId - The ID of the ticket to verify embedding for
     * @param messageId - The ID of the message to verify embedding for
     * @param userId - The ID of the user to verify geo enrichment for
     * 
     * @description Polls the database to verify that asynchronous worker jobs (embeddings and geo enrichment) have completed successfully.
     */
    it("should verify async worker processing", async () => {
        // Helper to poll for data
        const waitForData = async (check: () => Promise<boolean>, description: string) => {
            const start = Date.now();
            while (Date.now() - start < 45000) { // 45s poll limit
                if (await check()) return;
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            throw new Error(`Timeout waiting for ${description}`);
        };

        console.log("Waiting for async jobs...");

        // verifies ticket embedding
        // verifies ticket embedding
        await waitForData(async () => {
            const ticketRows: any[] = await prisma.$queryRaw`SELECT embedding FROM "Tickets" WHERE id = ${ticketId}`;
            return !!ticketRows[0]?.embedding;
        }, "Ticket Embedding");

        // verifies message embedding
        await waitForData(async () => {
             const messageRows: any[] = await prisma.$queryRaw`SELECT embedding FROM "Messages" WHERE id = ${messageId}`;
             return !!messageRows[0]?.embedding;
        }, "Message Embedding");

        // verifies geo enrichment
        await waitForData(async () => {
             const user = await prisma.users.findUnique({ where: { id: userId } });
             return !!user;
        }, "User Query");
        
    }, 60000); // 60s test-specific timeout
});
