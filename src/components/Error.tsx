export default function Error({ error }: { error: Error }) {
  return (
    <div className="text-red-500 p-4 bg-red-50 rounded-md">
      <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
      <p>{error?.message || 'An unexpected error occurred'}</p>
    </div>
  )
}