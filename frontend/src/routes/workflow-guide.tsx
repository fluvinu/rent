import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/workflow-guide")({
  component: WorkflowGuideComponent,
});

function WorkflowGuideComponent() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Advanced Workflow Guide</h1>
      <p className="mb-4 text-muted-foreground">
        Learn how to configure advanced business logic using our dynamic workflow system.
      </p>

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-2">1. Webhook Action</h2>
          <p className="mb-2">
            The <code>WEBHOOK</code> action allows you to send an HTTP POST request to an external URL whenever a record is created, updated, or deleted.
          </p>
          <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto dark:bg-gray-800">
{`{
  "kind": "WEBHOOK",
  "url": "https://your-webhook-listener.com/api/notify"
}`}
          </pre>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">2. Custom Script Execution</h2>
          <p className="mb-2">
            The <code>SCRIPT</code> action executes basic server-side JavaScript to mutate a record during a workflow automatically. The script has access to a <code>record</code> object representing the entity data.
          </p>
          <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto dark:bg-gray-800">
{`{
  "kind": "SCRIPT",
  "script": "record.put('status', 'PROCESSED'); record.put('calculatedValue', record.get('price') * 1.2);"
}`}
          </pre>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">3. Create Record Action</h2>
          <p className="mb-2">
            Creates a related record automatically when the workflow runs.
          </p>
          <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto dark:bg-gray-800">
{`{
  "kind": "CREATE_RECORD",
  "entityTypeId": "invoice_id",
  "data": { "amount": 100 }
}`}
          </pre>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">4. Update Field Action</h2>
          <p className="mb-2">
            Updates a specific field in the current record.
          </p>
          <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto dark:bg-gray-800">
{`{
  "kind": "UPDATE_FIELD",
  "field": "status",
  "value": "APPROVED"
}`}
          </pre>
        </section>
      </div>
    </div>
  );
}
