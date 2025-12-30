import { useState } from "react";
import axios from "axios";
import {
  UploadCloud,
  FileText,
  CheckCircle,
  Loader2,
  Send,
  Bot,
  User,
} from "lucide-react";

interface TaskStatus {
  status: "pending" | "processing" | "completed" | "failed";
}

interface Message {
  role: "user" | "ai";
  text: string;
}

function App() {
  // Reverted to Single File (File | null)
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<TaskStatus["status"] | null>(null);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]); // Only take the first one
      setStatus(null);
      setMessages([]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://127.0.0.1:8000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      pollStatus(res.data.task_id);
    } catch (err) {
      setUploading(false);
      alert("Upload failed!");
    }
  };

  const pollStatus = async (id: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/status/${id}`);
        setStatus(res.data.status);
        if (res.data.status === "completed" || res.data.status === "failed") {
          clearInterval(interval);
          setUploading(false);
        }
      } catch {
        clearInterval(interval);
        setUploading(false);
      }
    }, 2000);
  };

  const handleChat = async () => {
    if (!question.trim()) return;
    const newMessages: Message[] = [
      ...messages,
      { role: "user", text: question },
    ];
    setMessages(newMessages);
    setQuestion("");
    setChatLoading(true);

    try {
      const res = await axios.post("http://127.0.0.1:8000/chat", { question });
      setMessages([...newMessages, { role: "ai", text: res.data.answer }]);
    } catch (err) {
      setMessages([
        ...newMessages,
        { role: "ai", text: "Error getting answer." },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-xl shadow-xl max-w-2xl w-full border border-gray-100 flex flex-col gap-8">
        <div className="text-center">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            DocMind AI
          </h1>
          <p className="text-gray-500 mt-2">
            Chat with your documents in seconds
          </p>
        </div>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 hover:bg-blue-50 transition-all cursor-pointer relative group">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                <UploadCloud className="w-6 h-6 text-blue-600" />
              </div>
              <p className="font-medium text-gray-600">
                {file ? file.name : "Drop your PDF here"}
              </p>
            </div>
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || uploading || status === "completed"}
            className={`w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2
              ${
                status === "completed"
                  ? "bg-green-600 text-white"
                  : "bg-gray-900 text-white hover:bg-black"
              }`}
          >
            {uploading ? (
              <Loader2 className="animate-spin" />
            ) : status === "completed" ? (
              <CheckCircle />
            ) : (
              "Start Processing"
            )}
            {uploading
              ? "Analyzing..."
              : status === "completed"
              ? "Ready to Chat!"
              : "Upload & Process"}
          </button>
        </div>

        {status === "completed" && (
          <div className="border-t pt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Ask a Question
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 h-64 overflow-y-auto mb-4 space-y-4 border border-gray-100">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "ai" && (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`p-3 rounded-lg max-w-[80%] text-sm ${
                      msg.role === "user"
                        ? "bg-gray-900 text-white"
                        : "bg-white border shadow-sm text-gray-700"
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                </div>
              ))}
              {chatLoading && (
                <div className="flex gap-2 text-gray-400 text-sm ml-11">
                  <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleChat()}
                placeholder="Ex: What is the summary?"
                className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                onClick={handleChat}
                disabled={chatLoading || !question}
                className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
