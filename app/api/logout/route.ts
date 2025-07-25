import { logout } from '@/app/lib/sessions';
import { NextRequest } from 'next/server';
 
export async function POST(req: NextRequest) {
    // Process a POST request
    await logout();
    return new Response(JSON.stringify("OK"), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  
}