import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle, Star } from "lucide-react";
import { supabase, isMockMode } from "@/lib/supabase";
import { AdminBreadcrumb, AdminPageHeader, StatCard } from "./_layout";

export const Route = createFileRoute("/admin/reviews")({
  component: AdminReviews,
});

function useAdminReviews(status?: string) {
  return useQuery({
    queryKey: ["admin-reviews", status],
    queryFn: async () => {
      if (isMockMode) return [];
      let query = supabase
        .from("reviews")
        .select("*, profiles(name), listings(title, slug)")
        .order("created_at", { ascending: false });
      if (status) query = query.eq("status", status);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

function useModerateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "rejected" }) => {
      const { error } = await supabase.from("reviews").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-reviews"] }),
  });
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span style={{ display: "flex", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} size={13} fill={n <= rating ? "#E8B87A" : "none"} stroke={n <= rating ? "#E8B87A" : "#C8B0A0"} />
      ))}
    </span>
  );
}

function AdminReviews() {
  const [statusFilter, setStatusFilter] = useState("pending");
  const { data: reviews = [], isLoading } = useAdminReviews(statusFilter || undefined);
  const moderate = useModerateReview();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const act = async (id: string, status: "approved" | "rejected") => {
    setLoadingId(id);
    try { await moderate.mutateAsync({ id, status }); }
    catch (e) { alert((e as Error).message); }
    finally { setLoadingId(null); }
  };

  return (
    <div style={{ padding: "32px 36px" }}>
      <AdminBreadcrumb items={[{ label: "Reviews" }]} />
      <AdminPageHeader title="Reviews" />

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {["pending", "approved", "rejected", ""].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{
            padding: "6px 14px", borderRadius: "999px", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", border: "1.5px solid",
            borderColor: statusFilter === s ? "#7D4757" : "#E8C4C4",
            background: statusFilter === s ? "#7D475714" : "#FFFBFC",
            color: statusFilter === s ? "#7D4757" : "#8A6A6A",
          }}>
            {s || "All"}
          </button>
        ))}
      </div>

      {isMockMode ? (
        <div style={{ background: "#FFFBFC", borderRadius: "12px", border: "1.5px solid #E8C4C4", padding: "40px", textAlign: "center" }}>
          <p style={{ color: "#8A6A6A", fontSize: "0.88rem" }}>Reviews are stored in Supabase. Connect your project to see them here.</p>
        </div>
      ) : isLoading ? (
        <p style={{ color: "#8A6A6A" }}>Loading reviews…</p>
      ) : !reviews.length ? (
        <div style={{ background: "#FFFBFC", borderRadius: "12px", border: "1.5px solid #E8C4C4", padding: "40px", textAlign: "center", color: "#8A6A6A" }}>
          No {statusFilter} reviews.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {reviews.map((r: Record<string, unknown>) => {
            const profile = r.profiles as { name: string } | null;
            const listing = r.listings as { title: string; slug: string } | null;
            return (
              <div key={r.id as string} style={{ background: "#FFFBFC", borderRadius: "12px", border: "1.5px solid #E8C4C4", padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "10px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                      <p style={{ fontWeight: 600, color: "#2C1A1A", fontSize: "0.88rem" }}>{profile?.name ?? "Anonymous"}</p>
                      <StarRating rating={r.rating as number} />
                    </div>
                    {listing && <p style={{ fontSize: "0.78rem", color: "#7D4757" }}>on {listing.title}</p>}
                    <p style={{ fontSize: "0.75rem", color: "#8A6A6A" }}>{new Date(r.created_at as string).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                  {r.status === "pending" && (
                    <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                      <button onClick={() => act(r.id as string, "approved")} disabled={loadingId === r.id} style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "7px 14px", borderRadius: "8px", background: "#7DA88A", border: "none", color: "#fff", fontWeight: 600, fontSize: "0.78rem", cursor: "pointer" }}>
                        <CheckCircle size={13} /> Approve
                      </button>
                      <button onClick={() => act(r.id as string, "rejected")} disabled={loadingId === r.id} style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "7px 14px", borderRadius: "8px", background: "#F0E8EE", border: "1.5px solid #E8C4C4", color: "#C08080", fontWeight: 600, fontSize: "0.78rem", cursor: "pointer" }}>
                        <XCircle size={13} /> Reject
                      </button>
                    </div>
                  )}
                  {r.status !== "pending" && (
                    <span style={{ padding: "3px 10px", borderRadius: "999px", fontSize: "0.72rem", fontWeight: 700, background: r.status === "approved" ? "#7DA88A22" : "#C0808022", color: r.status === "approved" ? "#7DA88A" : "#C08080", textTransform: "capitalize" }}>
                      {r.status as string}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: "0.88rem", color: "#2C1A1A", lineHeight: 1.6, padding: "12px", background: "#F9EEF2", borderRadius: "8px" }}>
                  "{r.comment as string}"
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


