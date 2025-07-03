import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export default function ChatUIPage() {
  const filePath = path.join(process.cwd(), 'conversation.txt');
  let chatGroups = [];

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.split('\n').filter(line => line.trim() !== '');

    for (let i = 0; i < lines.length; i += 3) {
      const timestamp = lines[i]?.trim();
      const userLine = lines[i + 1]?.replace('user : ', '').trim();
      const botLine = lines[i + 2]?.replace('bot : ', '').trim();

      chatGroups.push({ timestamp, user: userLine, bot: botLine });
    }
  } catch (error) {
    return <p className="p-4 text-red-600">Failed to load chat history.</p>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md shadow-xl rounded-xl bg-white overflow-hidden">

        {/* Chat Box */}
        <div className="p-4 space-y-6 h-[700px] overflow-y-auto">
          {chatGroups.map((chat, index) => (
            <div key={index} className="space-y-2">
              {/* Time */}
              <div className="text-center text-xs text-gray-400">
                {formatTimestamp(chat.timestamp)}
              </div>

              {/* User Message */}
              <div className="flex justify-end">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-2xl shadow-md max-w-[75%]">
                  {chat.user}
                </div>
              </div>

              {/* Bot Message */}
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-2xl shadow-md max-w-[75%]">
                  {chat.bot}
                </div>
              </div>

              
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

// Helper: Convert timestamp to readable format
function formatTimestamp(raw) {
  try {
    // raw format: 47-10-16-23-06-25 → YY-MM-DD-HH-MM-SS
    const parts = raw.split('-');
    if (parts.length !== 6) return raw;
    const [yy, mm, dd, h, m, s] = parts;
    return `${dd}-${mm}-20${yy} ${h}:${m}:${s}`;
  } catch {
    return raw;
  }
}
