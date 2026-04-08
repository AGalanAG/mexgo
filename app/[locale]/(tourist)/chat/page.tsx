import Navbar from '@/components/tourist/Navbar'
import ChatUI from '@/components/tourist/ChatUI'

export default function ChatPage() {
  return (
    <div className="flex flex-col h-screen bg-white">
      <Navbar variant="light" />
      <div className="flex-1 overflow-hidden pt-16">
        <ChatUI />
      </div>
    </div>
  )
}
