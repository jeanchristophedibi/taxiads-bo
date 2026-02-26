import { ScreensTable } from '@/modules/screens/presentation/components/screens-table';

export default function EcransPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">Écrans</h1>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <ScreensTable />
      </div>
    </div>
  );
}
