# PostgreSQL (RDS) — encrypted at rest, automated backups, PITR (Vol 6 §6.2, §6.9).
resource "aws_db_subnet_group" "gaia" {
  name       = "gaia-${var.environment}"
  subnet_ids = aws_subnet.private[*].id
}

resource "aws_security_group" "postgres" {
  name_prefix = "gaia-${var.environment}-postgres-"
  vpc_id      = aws_vpc.gaia.id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr] # VPC-internal only (Vol 6 §9.1)
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_instance" "postgres" {
  identifier             = "gaia-${var.environment}"
  engine                 = "postgres"
  engine_version         = "16.3"
  instance_class         = var.db_instance_class
  allocated_storage      = 20
  db_name                = "gaia"
  username               = "gaia"
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.gaia.name
  vpc_security_group_ids = [aws_security_group.postgres.id]

  storage_encrypted       = true # AES-256 at rest (Vol 6 §9.3)
  backup_retention_period = 7    # daily snapshots (Vol 6 §6.9); 30 in prod
  skip_final_snapshot     = true # dev only
  multi_az                = false # dev only; Multi-AZ in prod (Vol 6 §6.2)
}

# Redis (ElastiCache) — cache/session layer (Vol 6 §6.6).
resource "aws_elasticache_subnet_group" "gaia" {
  name       = "gaia-${var.environment}"
  subnet_ids = aws_subnet.private[*].id
}

resource "aws_security_group" "redis" {
  name_prefix = "gaia-${var.environment}-redis-"
  vpc_id      = aws_vpc.gaia.id

  ingress {
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "gaia-${var.environment}"
  engine               = "redis"
  engine_version       = "7.1"
  node_type            = var.redis_node_type
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  subnet_group_name    = aws_elasticache_subnet_group.gaia.name
  security_group_ids   = [aws_security_group.redis.id]
}
