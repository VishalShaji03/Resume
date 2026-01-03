variable "aws_region" { default = "us-east-1" }
variable "tags" { default = { Project = "ResumeBackend", ManagedBy = "Terraform" } }

# GitHub (For Persistence)
variable "github_token" { sensitive = true }
variable "repo_owner" {}
variable "repo_name" {}

# Cloudflare Tunnel
variable "cloudflare_tunnel_token" { 
  sensitive = true 
  default   = "" # Set this after creating tunnel in Cloudflare dashboard
}