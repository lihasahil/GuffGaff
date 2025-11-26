
import { ImageIcon, Mic, Square, Send, X } from "lucide-react";

import {
  useRef,
  useState,
  useEffect,
  type ChangeEvent,
  type FormEvent,
} from "react";
import toast from "react-hot-toast";
import { useChat } from "../../../contexts/chat-contexts";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";

const MessageInput = () => {
  const [text, setText] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [voicePreview, setVoicePreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { sendMessage, selectedUser } = useChat();

  // --- Convert file to base64 string ---
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // --- Handle Image Selection ---
  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    try {
      const base64String = await fileToBase64(file);
      setSelectedImage(base64String);
      setImagePreview(URL.createObjectURL(file));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error("Failed to load image", error.message);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // --- Voice Recording ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setVoiceBlob(blob);
        setVoicePreview(URL.createObjectURL(blob));
        setIsRecording(false);
        setRecordTime(0);
        if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordTime(0);
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  const removeVoice = () => {
    setVoiceBlob(null);
    setVoicePreview(null);
    if (isRecording) stopRecording();
  };

  // --- Timer effect ---
  useEffect(() => {
    if (isRecording) {
      recordIntervalRef.current = setInterval(() => {
        setRecordTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
    }

    return () => {
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
    };
  }, [isRecording]);

  // --- Cleanup on unmount ---
  useEffect(() => {
    return () => {
      if (isRecording && mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
    };
  }, [isRecording]);

  // --- Convert voice blob to base64 ---
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
    });
  };

  // --- Send Message ---
  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !selectedImage && !voiceBlob) return;
    if (!selectedUser) return;

    try {
      let voiceBase64: string | null = null;
      if (voiceBlob) {
        voiceBase64 = await blobToBase64(voiceBlob);
      }

      await sendMessage(
        selectedUser._id,
        text.trim(),
        selectedImage,
        voiceBase64
      );

      // Reset states
      setText("");
      setSelectedImage(null);
      setImagePreview(null);
      setVoiceBlob(null);
      setVoicePreview(null);
      setRecordTime(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    }
  };

  // --- Format record time ---
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Simple animated bars (no audio analysis, just visual animation)
  const AnimatedWave = () => {
    return (
      <div className="flex-1 flex items-center justify-center gap-1 h-10 px-2">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="bg-gradient-to-t from-emerald-500 to-green-400 dark:from-emerald-600 dark:to-green-500 w-1 rounded-full"
            style={{
              height: "30%",
              animation: `wave 1.2s ease-in-out infinite`,
              animationDelay: `${i * 0.06}s`,
            }}
          />
        ))}
        <style>{`
          @keyframes wave {
            0%, 100% { height: 20%; }
            50% { height: 85%; }
          }
        `}</style>
      </div>
    );
  };

  return (
    <div className="p-4 w-full">
      {/* Image preview */}
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview || "/placeholder.svg"}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      {/* Voice preview */}
      {voicePreview && !isRecording && (
        <div className="mb-3 flex items-center gap-2">
          <audio controls src={voicePreview} className="w-48" />
          <Button variant="outline" size="icon" onClick={removeVoice}>
            <X size={18} />
          </Button>
        </div>
      )}

      {/* Recording indicator */}
      {isRecording && (
        <div className="relative flex items-center gap-3 p-2 rounded-2xl  w-full mb-2 border border-emerald-200 shadow-lg">
          {/* Green recording dot with glow */}
          <div className="relative z-10 flex items-center justify-center">
            <div className="absolute w-5 h-5 rounded-full bg-emerald-500/30 animate-ping" />
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]" />
          </div>

          {/* Timer */}
          <span className="relative z-10 text-xs font-semibold text-emerald-700 ">
            {formatTime(recordTime)}
          </span>

          {/* Animated Wave */}
          <AnimatedWave />

          {/* Stop button */}
          <button
            type="button"
            className="relative z-10 p-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-emerald-500/50"
            onClick={stopRecording}
          >
            <Square size={15} className="text-white fill-white" />
          </button>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <Input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <Input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          {/* Image upload button */}
          <Button
            variant="outline"
            type="button"
            className={`hidden sm:flex btn btn-circle ${
              imagePreview ? "text-emerald-500" : "text-zinc-400"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon size={20} />
          </Button>

          {/* Voice recording button */}
          {!isRecording ? (
            <Button
              variant="outline"
              type="button"
              className="btn btn-circle text-zinc-400 bg-transparent"
              onClick={startRecording}
            >
              <Mic size={20} />
            </Button>
          ) : (
            <Button
              variant="destructive"
              type="button"
              className="btn btn-circle"
              onClick={stopRecording}
            >
              <Square size={20} />
            </Button>
          )}
        </div>

        <Button
          variant="outline"
          type="submit"
          className="btn btn-sm btn-circle bg-transparent"
          disabled={!text.trim() && !selectedImage && !voiceBlob}
        >
          <Send size={22} />
        </Button>
      </form>
    </div>
  );
};

export default MessageInput;
