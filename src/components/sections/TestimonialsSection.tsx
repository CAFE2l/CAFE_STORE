'use client'
import { useEffect, useState } from 'react'

interface Feedback {
  id: string
  author_name: string
  author_role: string
  author_company: string
  author_avatar_url: string | null
  rating: number
  title: string
  body: string
  result_metric: string | null
  service_type: string
}

export function TestimonialsSection() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    fetch('/api/feedbacks/featured-services')
      .then(r => r.json())
      .then(data => {
        setFeedbacks(data.feedbacks ?? data.feedbacks ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-40 rounded-2xl bg-white/[0.03] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent animate-shimmer" />
          </div>
        ))}
      </div>
    )
  }

  if (feedbacks.length === 0) return null

  const serviceLabel: Record<string, string> = {
    landing_page:     'Landing Page',
    site:             'Site Profissional',
    saas:             'SaaS',
    pacote_completo:  'Pacote Completo',
    outro:            'Serviço',
  }

  return (
    <div className="flex flex-col gap-4">
      {feedbacks.map((fb, i) => (
        <div
          key={fb.id}
          className="glass-card p-6 animate-fade-up opacity-0"
          style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'forwards' }}
        >
          <div className="flex gap-1 mb-3">
            {[1,2,3,4,5].map(s => (
              <svg key={s} className={`w-4 h-4 ${s <= fb.rating ? 'text-brand' : 'text-white/10'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            ))}
          </div>

          <p className="text-white/75 text-sm leading-relaxed mb-4">&ldquo;{fb.body}&rdquo;</p>

          {fb.result_metric && (
            <div className="bg-brand/10 border border-brand/20 rounded-xl px-3 py-2 mb-4">
              <p className="text-brand text-xs font-medium">📈 {fb.result_metric}</p>
            </div>
          )}

          <div className="flex items-center gap-3">
            {fb.author_avatar_url ? (
              <img src={fb.author_avatar_url} alt={fb.author_name} className="w-9 h-9 rounded-full object-cover border border-white/10" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-brand/20 border border-brand/30 flex items-center justify-center text-brand text-xs font-bold">
                {fb.author_name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-white text-sm font-medium">{fb.author_name}</p>
              <p className="text-white/40 text-xs">{fb.author_role}{fb.author_company ? ` @ ${fb.author_company}` : ''}</p>
            </div>

            <span className="ml-auto text-[10px] px-2 py-1 rounded-full bg-white/[0.04] border border-white/[0.07] text-white/30">
              {serviceLabel[fb.service_type] ?? fb.service_type}
            </span>
          </div>
        </div>
      ))}

      <a href="/feedbacks" className="text-center text-brand/60 hover:text-brand text-sm transition-colors py-2">Ver todos os feedbacks →</a>
    </div>
  )
}
