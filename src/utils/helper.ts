import { customAlphabet } from "nanoid";
import bcryptjs from "bcryptjs";
import { config } from "../config";

export function stringToSlug(str: string) {
  return str
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .trim();
}

export function generateRandomString(length: number = 10) {
  const nanoid = customAlphabet(
    "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    length
  );

  return nanoid();
}

export async function hashPassword(clientPassword: string) {
  const salt = await bcryptjs.genSalt(config.saltWorkFactor);
  const hashedPassword = await bcryptjs.hash(clientPassword, salt);

  return hashedPassword;
}
