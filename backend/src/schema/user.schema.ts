import { object, string, TypeOf } from "zod";

/** Creating new user schema */
export const createUserSchema = object({
  body: object({
    emailAddress: string({
      required_error: "Email address is required",
    }).email("Not a valid email"),
    firstName: string({
      required_error: "First name is required",
    }),
    lastName: string({
      required_error: "Last name is required",
    }),
    password: string({
      required_error: "Password is required",
    }).min(8, "Password should not be less than 8 characters"),
    passwordConfirmation: string({
      required_error: "Password confirmation is required",
    }),
  }).refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  }),
});

/** Editing user schema */
export const editUserSchema = object({
  body: object({
    emailAddress: string({
      required_error: "Email address is required",
    }).email("Not a valid email"),
    firstName: string({
      required_error: "First name is required",
    }),
    lastName: string({
      required_error: "Last name is required",
    }),
  }),
});

/** Change user password schema */
export const changePasswordSchema = object({
  body: object({
    oldPassword: string({
      required_error: "Old password is required",
    }),
    newPassword: string({
      required_error: "New password is required",
    }).min(8, "New password should not be less than 8 characters"),
    newPasswordConfirmation: string({
      required_error: "Password confirmation is required",
    }),
  }).refine((data) => data.newPassword === data.newPasswordConfirmation, {
    message: "Passwords do not match",
    path: ["newPasswordConfirmation"],
  }),
});

/** Get single user schema */
export const getUserSchema = object({
  params: object({
    user_uuid: string({
      required_error: "user_uuid is required",
    }).refine((value) => /^[a-zA-Z0-9]+_user_[a-zA-Z0-9]{10}$/.test(value), {
      message: "Invalid user_uuid format",
    }),
  }),
});

/** Forgot password schema */
export const forgotPasswordSchema = object({
  params: object({
    email: string({
      required_error: "email is required",
    }).email("Not a valid email"),
  }),
});

/** Reset password schema */
export const resetPasswordSchema = object({
  params: object({
    passwordResetToken: string({
      required_error: "Password reset token is required",
    }),
  }),
  body: object({
    password: string({
      required_error: "Password is required",
    }).min(8, "Password should not be less than 8 characters"),
    passwordConfirmation: string({
      required_error: "Password confirmation is required",
    }),
  }).refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  }),
});

/** Exporting the schema types */
export type CreateUser = TypeOf<typeof createUserSchema>;
export type EditUser = TypeOf<typeof editUserSchema>;
export type ChangePassword = TypeOf<typeof changePasswordSchema>;
export type GetUser = TypeOf<typeof getUserSchema>;
export type ForgotPassword = TypeOf<typeof forgotPasswordSchema>;
export type ResetPassword = TypeOf<typeof resetPasswordSchema>;
