-- CreateIndex for HNSW (Hierarchical Navigable Small World) vector search
-- These indexes optimize cosine similarity searches on embedding columns

-- Create HNSW index on Tickets embedding for fast semantic search
CREATE INDEX IF NOT EXISTS "Tickets_embedding_idx" 
ON "Tickets" 
USING hnsw (embedding vector_cosine_ops);

-- Create HNSW index on Messages embedding for fast semantic search  
CREATE INDEX IF NOT EXISTS "Messages_embedding_idx" 
ON "Messages" 
USING hnsw (embedding vector_cosine_ops);
