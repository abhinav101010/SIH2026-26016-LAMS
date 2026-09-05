import ClayButton from '../components/ui/ClayButton'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-primary/10 mb-4">404</div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Page Not Found</h1>
        <p className="text-text-secondary mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
          <ClayButton variant="primary" onClick={() => window.location.href = '/dashboard'}>
            Back to Dashboard
          </ClayButton>
      </div>
    </div>
  )
}

export default NotFound
