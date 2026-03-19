const API_BASE = 'http://localhost:3001';

export async function startPipeline(params) {
  const res = await fetch(`${API_BASE}/api/workflow/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`Backend error: ${res.status}`);
  return res.json();
}

export async function pollStatus(workflowId) {
  const res = await fetch(`${API_BASE}/api/workflow/${workflowId}/status`);
  if (!res.ok) throw new Error(`Poll error: ${res.status}`);
  return res.json();
}
