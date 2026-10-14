import { createClient } from '@/lib/supabase/client'

export const authClient = {
  getSession: () => createClient().auth.getSession(),
  signOut: () => createClient().auth.signOut(),
  signIn: {
    email: ({ email, password }: { email: string; password: string }) =>
      createClient().auth.signInWithPassword({ email, password }),
  },
  signUp: {
    email: ({ name, email, password }: { name: string; email: string; password: string }) =>
      createClient().auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback`,
        },
      }),
  },
}
