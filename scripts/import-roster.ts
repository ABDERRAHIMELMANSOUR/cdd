/**
 * Command-line front end for the roster import.
 *
 * The logic lives in src/lib/roster.ts and is shared with the admin screen at
 * /admin/roster, so the two cannot drift apart. Use whichever is convenient:
 * this needs a machine that can reach the database, the admin screen needs
 * only a browser and a SUPER_ADMIN session.
 *
 *   npm run roster             preview — writes nothing
 *   npm run roster -- --apply  write
 */
import { importRoster } from "../src/lib/roster";
import { prisma } from "../src/lib/prisma";

const apply = process.argv.includes("--apply");

importRoster({ apply })
  .then((r) => {
    if (r.created.length) console.log("\ncreate:\n  " + r.created.join("\n  "));
    if (r.updated.length) console.log("\nupdate:\n  " + r.updated.join("\n  "));
    console.log(
      `\n${r.created.length} to create, ${r.updated.length} to update, ` +
        `${r.unchanged} already current, ${r.total} in the source file.` +
        (apply ? " Written.\n" : " Nothing written — pass --apply to write.\n")
    );
  })
  .catch((error) => {
    const code = (error as { code?: string }).code;
    console.error(`\n✗ ${code ? code + ": " : ""}${(error as Error).message}`);
    if (code === "P1001") console.error("  The database is unreachable — check DATABASE_URL.");
    if (code === "P2021") console.error("  The tables do not exist — run `npx prisma db push`.");
    console.error("");
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
