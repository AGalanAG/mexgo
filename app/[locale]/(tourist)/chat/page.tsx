import Navbar from '@/components/tourist/Navbar'
import ChatUI from '@/components/tourist/ChatUI'

export default function ChatPage() {
  return (
    <div className="flex flex-col h-screen bg-[var(--background)]">
      <Navbar />
      <div className="flex-1 overflow-hidden flex items-stretch py-6 px-4">
        <div className="w-full max-w-2xl mx-auto flex flex-col border border-[var(--primary)]/20 rounded-2xl overflow-hidden shadow-sm bg-surface">
          <ChatUI />
        </div>
      </div>
    </div>
  )
}
