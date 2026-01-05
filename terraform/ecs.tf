resource "aws_ecs_cluster" "main" {
  name = "resume-cluster"
}

resource "aws_ecs_cluster_capacity_providers" "spot" {
  cluster_name       = aws_ecs_cluster.main.name
  capacity_providers = ["FARGATE_SPOT"]
  
  default_capacity_provider_strategy {
    capacity_provider = "FARGATE_SPOT"
    weight            = 1
  }
}

resource "aws_ecr_repository" "repo" {
  name                 = "resume-backend"
  force_delete         = true
}

# Keep only the latest image - expire old ones
resource "aws_ecr_lifecycle_policy" "cleanup" {
  repository = aws_ecr_repository.repo.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep only 1 image"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 1
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

resource "aws_ecs_task_definition" "app" {
  family                   = "resume-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 512
  memory                   = 1024
  execution_role_arn       = aws_iam_role.execution.arn
  task_role_arn            = aws_iam_role.task.arn

  # Required for SOCI lazy-loading
  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "X86_64"
  }

  container_definitions = jsonencode([{
    name  = "backend"
    image = "${aws_ecr_repository.repo.repository_url}:latest"
    portMappings = [{ containerPort = 8000 }]
    environment = [
      { name = "GITHUB_TOKEN",            value = var.github_token },
      { name = "REPO_OWNER",              value = var.repo_owner },
      { name = "REPO_NAME",               value = var.repo_name },
      { name = "CLUSTER_NAME",            value = aws_ecs_cluster.main.name },
      { name = "CLOUDFLARE_TUNNEL_TOKEN", value = var.cloudflare_tunnel_token }
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = "/ecs/resume-task"
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])
}

resource "aws_cloudwatch_log_group" "logs" {
  name = "/ecs/resume-task"
}