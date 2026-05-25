'use client'

import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-surface-base flex items-center justify-center px-4">
      <div className="glass-card max-w-md w-full p-10 animate-fade-up">
        <ResetPasswordForm />
      </div>
    </main>
  )
}
