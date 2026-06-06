import { useNavigate } from 'react-router-dom'
import { ShieldOff, ArrowLeft } from 'lucide-react'
import { Button } from '../components/ui/Button'

export default function UnauthorizedPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f2f2f7] dark:bg-[#080808] px-4">
      <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-6">
        <ShieldOff className="w-8 h-8 text-red-600 dark:text-red-400" strokeWidth={1.5} />
      </div>
      <h1 className="text-6xl font-bold text-gray-900 dark:text-white tracking-tight mb-3">403</h1>
      <p className="text-gray-500 dark:text-zinc-400 text-sm mb-8 text-center max-w-xs">
        You don't have permission to access this page.
      </p>
      <Button icon={ArrowLeft} onClick={() => navigate(-1)}>Go back</Button>
    </div>
  )
}
