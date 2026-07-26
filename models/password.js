import bcryptjs from "bcryptjs";
import { InternalServerError } from "infra/errors";
import crypto from "node:crypto";

async function hash(password) {
  const rounds = getNumberOfRounds();
  return await bcryptjs.hash(applyPepper(password), rounds);
}

function getNumberOfRounds() {
  let rounds = 1;

  if (process.env.NODE_ENV === "production") {
    rounds = 14;
  }

  return rounds;
}

function applyPepper(password) {
  const pepper = process.env.PEPPER || "Bell_Pepper";

  if (!pepper) {
    throw new InternalServerError({
      cause: "A variável de ambiente PEPPER não está definida.",
    });
  }
  return crypto.createHmac("sha256", pepper).update(password).digest("hex");
}

async function compare(providedPassword, storedPassword) {
  return await bcryptjs.compare(applyPepper(providedPassword), storedPassword);
}

const password = {
  hash,
  compare,
};

export default password;
