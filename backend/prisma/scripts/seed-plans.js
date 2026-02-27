"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    await prisma.plan.upsert({
        where: { name: "FREE" },
        update: {},
        create: {
            name: "FREE",
            price: 0,
            currency: "USD",
            features: {
                basic_dashboard: true,
            },
            limits: {
                users: 3,
            },
        },
    });
    console.log("✅ FREE plan seeded");
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
