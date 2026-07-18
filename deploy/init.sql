-- Extensions PostgreSQL requises
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Augmenter les locks pour les advisory locks (commandes)
-- (déjà configuré dans docker-compose via -c max_locks_per_transaction=256)
