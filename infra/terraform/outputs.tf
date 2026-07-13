output "postgres_endpoint" {
  value       = aws_db_instance.postgres.address
  description = "PostgreSQL endpoint for the gaia-api service."
}

output "redis_endpoint" {
  value       = aws_elasticache_cluster.redis.cache_nodes[0].address
  description = "Redis endpoint for the cache layer."
}

output "eks_cluster_name" {
  value       = aws_eks_cluster.gaia.name
  description = "EKS cluster name for kubectl configuration."
}
