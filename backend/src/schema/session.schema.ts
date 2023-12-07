import { object, string } from "zod";

export const loginLocalSchema = object({
  body: object({
    email: string({ required_error: "email field is required" }).email(
      "Not a valid email"
    ),
    password: string({
      required_error: "password field is required",
    }),
  }),
});
