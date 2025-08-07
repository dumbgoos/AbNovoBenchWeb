import { NextRequest, NextResponse } from 'next/server';

// Backend API base URL
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'http://backend:5000/api' 
  : 'http://localhost:5000/api';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    console.log('Frontend API proxy - requesting model checkpoint download from backend:', `${API_BASE_URL}/download/models/${id}/checkpoint`);

    // Forward request to backend API (including any authorization headers)
    const authHeader = request.headers.get('authorization');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const backendResponse = await fetch(`${API_BASE_URL}/download/models/${id}/checkpoint`, {
      method: 'GET',
      headers,
    });

    if (!backendResponse.ok) {
      throw new Error(`Backend responded with status: ${backendResponse.status}`);
    }

    // Get the response as a stream/blob for file download
    const contentType = backendResponse.headers.get('Content-Type') || 'application/octet-stream';
    const contentDisposition = backendResponse.headers.get('Content-Disposition');
    const blob = await backendResponse.blob();

    console.log('Frontend API proxy - received model checkpoint file from backend, size:', blob.size);

    // Return the file response with appropriate headers
    const response = new NextResponse(blob, { 
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': contentDisposition || 'attachment; filename="model_checkpoint.pth"',
      }
    });

    return response;

  } catch (error) {
    console.error('Frontend API proxy error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to download model checkpoint from backend',
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