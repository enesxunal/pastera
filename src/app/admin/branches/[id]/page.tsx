import { AdminBranchDetailClient } from "@/components/admin/AdminBranchDetailClient";

export default function AdminBranchDetailPage({ params }: { params: { id: string } }) {
  return <AdminBranchDetailClient branchId={params.id} />;
}
