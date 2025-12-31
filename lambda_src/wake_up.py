import boto3
import os

def handler(event, context):
    ecs = boto3.client('ecs')
    cluster = os.environ['CLUSTER_NAME']
    
    # Check if task is already running
    active = ecs.list_tasks(cluster=cluster, desiredStatus='RUNNING')
    if active['taskArns']:
        return {"status": "ready", "message": "Backend is already warm."}
    
    # Fire the starter pistol (FARGATE_SPOT)
    ecs.run_task(
        cluster=cluster,
        taskDefinition=os.environ['TASK_DEFINITION'],
        launchType='FARGATE',
        capacityProviderStrategy=[{'capacityProvider': 'FARGATE_SPOT', 'weight': 1}],
        networkConfiguration={
            'awsvpcConfiguration': {
                'subnets': os.environ['SUBNETS'].split(','),
                'assignPublicIp': 'ENABLED'
            }
        }
    )
    return {"status": "booting", "message": "Phantom Backend is waking up..."}