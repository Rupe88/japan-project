
export const API_ROUTES = {
  // Auth
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    verifyEmail: "/auth/verify-email",
    resendVerification: "/auth/resend-verification",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
    profile: "/auth/profile",
    validateToken: "/auth/validate",
    passwordReset: {
      request: "/auth/password-reset/request",
      verify: "/auth/password-reset/verify",
    },
  },

  platform: {
    list: "/users/platforms",
    select: "/users/platforms",
    kyc: {
      submit: "/users/platform/kyc/submit",
      status: "/users/platform/kyc/status",
      list: "/users/platform/kyc/list",
    },
  },

  user: {
    profile: "/users/profile",
    update: "/users/profile",
    delete: "/users/profile",
  },
} as const
