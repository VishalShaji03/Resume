resource "aws_ecs_cluster" "main" { name = "phantom-cluster" }

resource "aws_ecs_cluster_capacity_providers" "spot" {
  cluster_name = aws_ecs_cluster.main.name
  capacity_providers = ["FARGATE_SPOT"]
  default_capacity_provider_strategy { capacity_provider = "FARGATE_SPOT", weight = 1 }
}

resource "aws_ecr_repository" "repo" {
  name                 = "phantom-backend"
  image_tag_mutability = "MUTABLE"
  force_delete         = true
}

resource "aws_ecs_task_definition" "app" {
  family                   = "phantom-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 512
  memory                   = 1024
  execution_role_arn       = aws_iam_role.execution.arn
  task_role_arn            = aws_iam_role.task.arn

  container_definitions = jsonencode([{
    name  = "backend"
    image = "${aws_ecr_repository.repo.repository_url}:latest"
    portMappings = [{ containerPort = 8000 }]
    environment = [
      { name = "CF_ZONE_ID",   value = var.cf_zone_id },
      { name = "CF_RECORD_ID", value = var.cf_record_id },
      { name = "CF_API_TOKEN", value = var.cf_api_token },
      { name = "CLUSTER_NAME", value = "phantom-cluster" }
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = "/ecs/phantom-task"
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])
}

resource "aws_cloudwatch_log_group" "logs" {
  name              = "/ecs/phantom-task"
  retention_in_days = 7
}