import { NextResponse } from 'next/server'

export function GET() {
  return NextResponse.json({ error: 'Supabase Auth is used for authentication.' }, { status: 404 })
}

export function POST() {
  return NextResponse.json({ error: 'Supabase Auth is used for authentication.' }, { status: 404 })
}
