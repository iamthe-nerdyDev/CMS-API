import { customAlphabet } from "nanoid";

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
