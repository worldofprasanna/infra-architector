
-- INFRA ARCHITECTOR - DATABASE SCHEMA

-- Main table for architecture recommendations
CREATE TABLE architecture_recommendations (
  id SERIAL PRIMARY KEY,

  -- User information
  email VARCHAR(255) NOT NULL,

  -- AWS resources collected from answers
  -- Example: ["S3", "CLOUDFRONT", "LAMBDA", "MULTI_AZ", "AUTO_SCALING"]
  aws_resources TEXT[] NOT NULL,

  -- Recommended template
  selected_template VARCHAR(100) NOT NULL,

  -- Estimated monthly cost for this architecture
  -- Example: "$200 - $500", "$800 - $2,000", "$2,000+"
  estimated_monthly_cost VARCHAR(100),

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_email ON architecture_recommendations(email);
CREATE INDEX idx_template ON architecture_recommendations(selected_template);
CREATE INDEX idx_created_at ON architecture_recommendations(created_at DESC);

-- Index for querying AWS resources (array)
CREATE INDEX idx_resources ON architecture_recommendations USING GIN (aws_resources);

-- ============================================================================
-- SAMPLE DATA (for testing)
-- ============================================================================

-- INSERT INTO architecture_recommendations (
--   email,
--   aws_resources,
--   selected_template,
--   estimated_monthly_cost
-- ) VALUES (
--   'test@example.com',
--   ARRAY['BASIC_SETUP', 'SIMPLE_ARCH', 'LOW_SCALE', 'AWS'],
--   'basic_web_app',
--   '$200 - $500'
-- );
