-- Adicionar campos para destaque na página de serviços
ALTER TABLE feedbacks 
  ADD COLUMN IF NOT EXISTS is_featured_services BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS featured_services_order INTEGER DEFAULT 0;

-- Índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_feedbacks_featured_services 
  ON feedbacks(is_featured_services, featured_services_order) 
  WHERE is_featured_services = true AND is_approved = true;
