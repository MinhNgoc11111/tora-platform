import { NextResponse } from 'next/server';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  console.log("API HIT:", params.id);
  return NextResponse.json({ id: params.id });
}