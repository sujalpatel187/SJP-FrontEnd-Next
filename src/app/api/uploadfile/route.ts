import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await request.formData();
    const file = formData.get('document') as File;

    // Validate file
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file extension
    const allowedExtensions = ['pdf', 'docx', 'doc', 'txt'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { 
          error: `File type not allowed. Supported types: ${allowedExtensions.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxFileSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxFileSize) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Create FormData to send to FastAPI backend
    const backendFormData = new FormData();
    backendFormData.append('document', file);

    // Forward the request to FastAPI backend
    const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_SERVER_URL}/upload/`, {
      method: 'POST',
      body: backendFormData,
    });

    // Get the response from FastAPI
    const backendResult = await backendResponse.json();

    // Check if the backend request was successful
    if (!backendResponse.ok) {
      return NextResponse.json(
        { 
          error: backendResult.detail || 'Backend upload failed',
          details: backendResult
        },
        { status: backendResponse.status }
      );
    }

    // Return success response
    return NextResponse.json(backendResult, { status: 200 });

  } catch (error: any) {
    console.error('Upload error:', error);
    
    // Handle different types of errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return NextResponse.json(
        { 
          error: 'Cannot connect to backend server. Please ensure FastAPI is running on http://localhost:8000' 
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to upload files.' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to upload files.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to upload files.' },
    { status: 405 }
  );
}