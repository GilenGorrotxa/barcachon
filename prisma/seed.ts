import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database with menu data...");

  const menuDataPath = path.join(process.cwd(), "lib", "menu-data.json");
  const menuData = JSON.parse(fs.readFileSync(menuDataPath, "utf-8"));

  // Eliminar dato existente si lo hay
  await prisma.menuData.deleteMany({});

  // Crear registro con los datos del menú
  const result = await prisma.menuData.create({
    data: {
      id: "current",
      version: 1,
      data: menuData,
    },
  });

  console.log("✅ Menu data seeded successfully!");
  console.log(`   - Record ID: ${result.id}`);
  console.log(`   - Version: ${result.version}`);
  console.log(`   - Created: ${result.createdAt}`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
