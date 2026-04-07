import ChatUI from '@/components/tourist/ChatUI'

export default function ChatPage() {
  return (
    <div className="flex flex-col h-screen bg-white">
      <header className="border-b border-zinc-200 px-6 py-4">
        <h1 className="text-lg font-semibold text-zinc-900">Asistente MexGo</h1>
        <p className="text-xs text-zinc-400">Powered by Gemini</p>
      </header>
      <ChatUI />
    </div>
  )
}
