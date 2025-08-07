import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'http://backend:5000/api' 
  : 'http://localhost:5000/api';

export async function POST(request: NextRequest) {
  try {
    console.log('Frontend API proxy - processing login request');
    const body = await request.json();
    
    const backendResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const backendData = await backendResponse.json();
    
    console.log('Frontend API proxy - login response status:', backendResponse.status);
    
    return NextResponse.json(backendData, {
      status: backendResponse.status,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Frontend API proxy login error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to process login request',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
} 