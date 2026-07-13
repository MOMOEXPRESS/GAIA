variable "aws_region" {
  description = "Primary region (Vol 6 §3.3: production primary is us-east-1)."
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment name."
  type        = string
  default     = "dev"
}

variable "vpc_cidr" {
  description = "CIDR block for the private VPC (Vol 6 §9.1)."
  type        = string
  default     = "10.20.0.0/16"
}

variable "db_instance_class" {
  description = "RDS PostgreSQL instance class (dev-sized)."
  type        = string
  default     = "db.t4g.micro"
}

variable "db_password" {
  description = "Master password for dev PostgreSQL. In production this comes from a secret manager (Vol 6 §9.6), never tfvars."
  type        = string
  sensitive   = true
}

variable "redis_node_type" {
  description = "ElastiCache node type (dev-sized)."
  type        = string
  default     = "cache.t4g.micro"
}

variable "eks_cluster_version" {
  description = "Kubernetes version for EKS (Vol 6 §12.2)."
  type        = string
  default     = "1.30"
}
