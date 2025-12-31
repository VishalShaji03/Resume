import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { ECSClient, StopTaskCommand } from "@aws-sdk/client-ecs";

const IDLE_TIMEOUT = 10 * 60 * 1000; // 10 mins
let lastActivity = Date.now();
const ecs = new ECSClient({ region: "us-east-1" });

// 1. Cloudflare DNS Self-Announcement
const syncDNS = async () => {
  const ip = await fetch('https://checkip.amazonaws.com').then(r => r.text());
  await fetch(`https://api.cloudflare.com/client/v4/zones/${process.env.CF_ZONE_ID}/dns_records/${process.env.CF_RECORD_ID}`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${process.env.CF_API_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: ip.trim(), ttl: 60, proxied: false })
  });
  console.log(`[Phantom] DNS updated to ${ip.trim()}`);
};

// 2. Self-Destruct Timer
setInterval(async () => {
  if (Date.now() - lastActivity > IDLE_TIMEOUT) {
    const meta = await fetch("http://169.254.170.2/v2/metadata").then(r => r.json());
    await ecs.send(new StopTaskCommand({ cluster: process.env.CLUSTER_NAME, task: meta.TaskARN }));
  }
}, 60000);

// 3. Elysia API (Efficent Token/Diff Editing)
new Elysia()
  .use(cors())
  .onBeforeHandle(() => { lastActivity = Date.now(); })
  .get("/health", () => ({ status: "warm" }))
  .post("/update", async ({ body }: any) => {
      // Mimics Cursor search/replace logic locally
      let tex = await Bun.file("resume.tex").text();
      body.patches.forEach((p: any) => { tex = tex.replace(p.search, p.replace); });
      await Bun.write("resume.tex", tex);
      
      const proc = Bun.spawn(["tectonic", "resume.tex"]);
      await proc.exited;
      return new Response(Bun.file("resume.pdf"));
  })
  .listen(8000);

syncDNS();