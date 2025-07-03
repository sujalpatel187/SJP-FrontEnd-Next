import FileUpload from '../components/FileUpload/page.js';

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Document Upload
          </h1>
          <p className="text-gray-600">
            Upload your documents securely to our server
          </p>
        </div>
        
        <FileUpload />
        
        <div className="max-w-md mx-auto mt-8 p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Upload Guidelines:
          </h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Supported formats: PDF, DOCX, DOC, TXT</li>
            <li>• Maximum file size: 10MB</li>
            <li>• Files are stored in timestamp-based folders</li>
            <li>• Each upload creates a unique folder</li>
          </ul>
        </div>
      </div>
    </div>
  );
}