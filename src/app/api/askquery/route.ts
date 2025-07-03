import { NextRequest, NextResponse } from 'next/server';
import { writeFile, appendFile } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userMessage = body.question || 'User message not provided';

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_SERVER_URL}/askquery/`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log("Response from backend:", data);
    const botReply = (typeof data.response === 'string')
      ? data.response.replace(/\s+/g, ' ')
      : JSON.stringify(data.response).replace(/\s+/g, ' ');

   const now = new Date();

    // Utility to pad numbers to two digits
    const pad = (n: number) => n.toString().padStart(2, '0');

    // Format as: day-month-year && hour:min:sec
    const date = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()} && ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    console.log("Formatted date-time:", date);

    // Format chat log
    const logEntry = `${date}\nuser : ${userMessage}\nbot : ${botReply}\n\n`;

    // Define log file path (in /tmp folder on server or project root)
    const filePath = path.join(process.cwd(), 'conversation.txt');

    // Append the log
    await appendFile(filePath, logEntry, 'utf8');

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in /api/askquery route:", error);
    return NextResponse.json(
      { error: 'Failed to send question to backend' },
      { status: 500 }
    );
  }
}
