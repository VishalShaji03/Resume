import boto3

def handler(event, context):
    ecs = boto3.client('ecs')
    # Check if task is already running to avoid duplicates
    tasks = ecs.list_tasks(cluster='resume-cluster', serviceName='resume-service')
    
    if not tasks['taskArns']:
        ecs.run_task(
            cluster='resume-cluster',
            launchType='FARGATE',
            taskDefinition='resume-task',
            count=1,
            capacityProviderStrategy=[{'capacityProvider': 'FARGATE_SPOT', 'weight': 1}]
        )
        return {"status": "starting", "message": "Phantom Backend is waking up..."}
    
    return {"status": "running", "message": "Backend is already warm."}