export default function LoadingSpinner({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="h-8 w-8 rounded-full border-2 border-gray-200 border-t-emerald-600 animate-spin" />
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  )
}
