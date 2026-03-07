import { useAuth } from "../contexts/AuthContext";

export default function DebugPage() {
  const { user, role, isLoading, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Debug Auth State</h1>

        <div className="space-y-4 font-mono text-sm">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="font-bold">isLoading:</p>
            <p>{String(isLoading)}</p>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="font-bold">isAuthenticated:</p>
            <p>{String(isAuthenticated)}</p>
          </div>

          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <p className="font-bold">role:</p>
            <p className="text-lg text-green-700">
              {role || "(null/undefined)"}
            </p>
          </div>

          <div className="p-3 bg-purple-50 border border-purple-200 rounded">
            <p className="font-bold">user.id:</p>
            <p>{user?.id || "(null)"}</p>
          </div>

          <div className="p-3 bg-purple-50 border border-purple-200 rounded">
            <p className="font-bold">user.email:</p>
            <p>{user?.email || "(null)"}</p>
          </div>

          <div className="p-3 bg-purple-50 border border-purple-200 rounded">
            <p className="font-bold">user.role:</p>
            <p className="text-lg">{user?.role || "(null)"}</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm font-bold mb-2">📋 Full localStorage:</p>
          <pre className="text-xs overflow-auto max-h-40">
            {JSON.stringify(
              {
                token: localStorage.getItem("token")
                  ? "✓ (set)"
                  : "✗ (missing)",
                user: localStorage.getItem("user")
                  ? JSON.parse(localStorage.getItem("user") || "{}")
                  : null,
                role: localStorage.getItem("role"),
              },
              null,
              2,
            )}
          </pre>
        </div>

        <a
          href="/profile"
          className="mt-6 inline-block bg-blue-600 text-white px-4 py-2 rounded"
        >
          Try /profile
        </a>
      </div>
    </div>
  );
}
