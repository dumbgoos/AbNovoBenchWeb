import { NextRequest, NextResponse } from 'next/server';

// Backend API base URL
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'http://backend:5000/api' 
  : 'http://localhost:5000/api';

export async function GET(request: NextRequest, { params }: { params: { fileId: string } }) {
  try {
    const { fileId } = await params;
    
    console.log('Frontend API proxy - requesting MGF file preview from backend:', `${API_BASE_URL}/datasets/mgf/${fileId}/preview`);

    // Forward request to backend API
    const backendResponse = await fetch(`${API_BASE_URL}/datasets/mgf/${fileId}/preview`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!backendResponse.ok) {
      throw new Error(`Backend responded with status: ${backendResponse.status}`);
    }

    const backendData = await backendResponse.json();
    console.log('Frontend API proxy - received MGF file preview from backend');

    // Return the backend response
    return NextResponse.json(backendData, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Frontend API proxy error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to fetch MGF file preview from backend',
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