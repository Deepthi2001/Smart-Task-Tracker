export default function Page() {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <p><strong>TODO (candidate)</strong>: Implement the task list, status filter, create/edit form, and Smart Intake UI.</p>
      <ul>
        <li>Call your FastAPI endpoints at <code>process.env.NEXT_PUBLIC_API_BASE</code>.</li>
        <li>Render tasks with a simple status filter (Todo / In-Progress / Done).</li>
        <li>Provide a form to create tasks (title + priority at minimum).</li>
        <li>Smart Intake: paste paragraph → show suggested title + priority before save.</li>
      </ul>
    </div>
  );
}