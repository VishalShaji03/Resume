import { DynamoDBClient, GetItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const LIMIT = 1.00; // $1.00 USD
const db = new DynamoDBClient({});
const bedrock = new BedrockRuntimeClient({});

export const handler = async (event: any) => {
    const today = new Date().toISOString().split('T')[0];

    // 1. Check Spend
    const current = await db.send(new GetItemCommand({
        TableName: "DailySpend",
        Key: { date: { S: today } }
    }));
    
    const total = parseFloat(current.Item?.total?.N || "0");
    if (total > LIMIT) {
        return { statusCode: 402, body: "Budget Exceeded" };
    }

    // 2. Proxy to Bedrock
    const response = await bedrock.send(new InvokeModelCommand({
        modelId: "meta.llama3-70b-instruct-v1:0",
        body: JSON.stringify(event.payload)
    }));

    // 3. Log Spend (Approximate calculation based on token count)
    await db.send(new UpdateItemCommand({
        TableName: "DailySpend",
        Key: { date: { S: today } },
        UpdateExpression: "ADD total :cost",
        ExpressionAttributeValues: { ":cost": { N: "0.005" } } // Placeholder per call
    }));

    return JSON.parse(new TextDecoder().decode(response.body));
};