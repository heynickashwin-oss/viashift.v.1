const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const TIMEOUT_MS = 60000;

interface AINode {
  id: string;
  type: string;
  label: string;
  layer: number;
  description?: string;
}

interface AIConnection {
  id: string;
  from: string;
  to: string;
  type?: string;
  label?: string;
}

interface PainPoint {
  nodeId: string;
  issue: string;
}

interface WorkflowResponse {
  summary: string;
  nodes: any[];
  connections: any[];
  painPoints?: PainPoint[];
}

const iconMap: Record<string, string> = {
  database: '◧',
  user: '◉',
  processor: '◎',
  api: '⚡',
  document: '▤',
  storage: '◫',
  network: '◈',
  security: '◪',
  analytics: '◭',
  notification: '◮',
  workflow: '◬',
  default: '●',
};

function getIconForType(type: string): string {
  const normalizedType = type.toLowerCase();
  return iconMap[normalizedType] || iconMap.default;
}

export async function generateWorkflowFromTranscript(
  transcript: string
): Promise<WorkflowResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

    if (!apiKey || apiKey === 'your_api_key_here') {
      throw new Error('Anthropic API key not configured. Please add your API key to the .env file.');
    }

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: `You are a business process analyst creating animated workflow visualizations. Analyze this transcript and extract a workflow that tells a story over time.

CRITICAL INSTRUCTIONS:

1. TEMPORAL SEQUENCING: Assign appearTime (0-10 seconds) to each node based on:
   - Chronological order (earlier years/events = lower appearTime)
   - Process flow (inputs appear before outputs)
   - Founding/origin elements at 0-1s, growth at 2-5s, current state at 6-10s
   - If a node references a year, use: appearTime = (year - earliestYear) / (latestYear - earliestYear) * 8 + 1

2. SPATIAL LAYOUT: Spread nodes across the canvas to avoid clutter:
   - Use x: -400 to 400, y: -300 to 300 range
   - Minimum 150px between adjacent nodes
   - Group related nodes but maintain spacing

3. CONNECTION LABELS: Keep labels SHORT (max 3 words or one number):
   - Good: "$500M", "quarterly", "API call", "approved"
   - Bad: "$500M equity commitment from anchor investors"

Node types: database, server, storage, processor, api, user, analytics, cloud, security, gateway, document
Layers: 1=infrastructure, 2=operations/teams, 3=outputs/results (use 1-3, not 0-2)
Connection types: normal, manual, conditional
Volume: low, medium, high
Duration: instant, minutes, hours, days, weeks

Return ONLY valid JSON, no markdown:
{"summary":"one sentence","nodes":[{"id":"node_1","type":"database","label":"Name","layer":1,"x":0,"y":0,"appearTime":0}],"connections":[{"id":"conn_1","from":"node_1","to":"node_2","label":"short label","type":"normal","volume":"medium","duration":"instant"}],"painPoints":[{"nodeId":"node_1","issue":"description"}]}

TRANSCRIPT:
${transcript}`
        }]
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error:', errorText);
      throw new Error(`Failed to generate workflow: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Claude API response:', JSON.stringify(data, null, 2));

    if (!data.content || !Array.isArray(data.content) || data.content.length === 0) {
      throw new Error('Invalid response format: missing content array');
    }

    const contentText = data.content[0].text;
    const cleanedText = contentText
      .replace(/^```json\n?/, '')
      .replace(/\n?```$/, '')
      .trim();

    console.log('Cleaned JSON:', cleanedText);

    let parsedContent;
    try {
      parsedContent = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Failed to parse AI response. The response format was invalid.');
    }

    if (!parsedContent.nodes || !parsedContent.connections) {
      throw new Error('Invalid response format: missing nodes or connections');
    }

    const nodesWithIcons = parsedContent.nodes.map((node: AINode) => ({
      ...node,
      icon: getIconForType(node.type),
    }));

    return {
      summary: parsedContent.summary || '',
      nodes: nodesWithIcons,
      connections: parsedContent.connections,
      painPoints: parsedContent.painPoints,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out after 60 seconds');
      }
      throw error;
    }

    throw new Error('An unknown error occurred');
  }
}
