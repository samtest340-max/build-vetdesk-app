import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | undefined

export function createClient() {
  if (client) return client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return createUnavailableClient() as ReturnType<typeof createBrowserClient>
  client = createBrowserClient(url, key)
  return client
}

function createUnavailableClient() {
  const result = Promise.resolve({ data: null, error: { message: 'The legacy Supabase service is not configured.' } })
  const chain = () => ({
    select: () => chain(),
    insert: () => chain(),
    update: () => chain(),
    upsert: () => chain(),
    delete: () => chain(),
    eq: () => chain(),
    neq: () => chain(),
    gte: () => chain(),
    lte: () => chain(),
    order: () => chain(),
    limit: () => chain(),
    maybeSingle: () => result,
    single: () => result,
    then: result.then.bind(result),
  })
  return {
    auth: { getUser: async () => ({ data: { user: null }, error: { message: 'Sign in required.' } }) },
    from: () => chain(),
    channel: () => ({ on: () => ({ subscribe: () => ({}) }) }),
    removeChannel: async () => undefined,
  }
}
