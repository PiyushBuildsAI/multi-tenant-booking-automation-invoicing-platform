export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="text-zinc-500 text-sm">Manage your business settings, templates, and email configuration.</p>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-white border rounded-xl p-5">
          <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500 mb-2">Business Profile</h2>
          <p className="text-sm">Configure your business name, logo, and contact details.</p>
        </div>
        <div className="bg-white border rounded-xl p-5">
          <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500 mb-2">Invoice Templates</h2>
          <p className="text-sm">Create and manage templated invoices for common services.</p>
        </div>
        <div className="bg-white border rounded-xl p-5">
          <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500 mb-2">Email Templates</h2>
          <p className="text-sm">Configure email templates for automated sequences.</p>
        </div>
        <div className="bg-white border rounded-xl p-5">
          <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500 mb-2">Calendar Sync</h2>
          <p className="text-sm">Manage your connected calendars and sync preferences.</p>
        </div>
      </div>
    </div>
  )
}
