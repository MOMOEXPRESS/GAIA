# Gaia development environment infrastructure (Blueprint Vol 6 §12.1:
# "All cloud resources are defined in Terraform... Nothing is manually
# provisioned"). Dev topology: VPC + RDS PostgreSQL + ElastiCache Redis + EKS.

terraform {
  required_version = ">= 1.7.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.60"
    }
  }

  # Remote state (uncomment and configure per environment):
  # backend "s3" {
  #   bucket         = "gaia-terraform-state"
  #   key            = "dev/terraform.tfstate"
  #   region         = "us-east-1"
  #   dynamodb_table = "gaia-terraform-locks"
  #   encrypt        = true
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "gaia"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}
