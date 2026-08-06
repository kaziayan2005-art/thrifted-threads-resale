import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle, Star, MessageSquare } from "lucide-react";
import { supabase, isMockMode } from "@/lib/supabase";
import { AdminBreadcrumb, AdminPageHeader } from "./_layout";

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
        .select("*, listings(title, slug)")
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
    <span style={{ display: "inline-flex", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={12} fill={n <= rating ? "#E8B87A" : "none"} stroke={n <= rating ? "#E8B87A" : "#C8B0A0"} />
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
    try {
      await moderate.mutateAsync({ id, status });
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div style={{ padding: "32px 36px" }}>
      <AdminBreadcrumb items={[{ label: "Reviews" }]} />
      <AdminPageHeader title="Review Moderation" />

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {["pending", "approved", "rejected", ""].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={{
              padding: "6px 14px",
              borderRadius: "999px",
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: "pointer",
              border: "1.5px solid",
              borderColor: statusFilter === s ? "#7D4757" : "#E8C4C4",
              background: statusFilter === s ? "#7D475714" : "#FFFBFC",
              color: statusFilter === s ? "#7D4757" : "#8A6A6A",
            }}
          >
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : "All Reviews"}
          </button>
        ))}
      </div>

      {/* Dense Table Layout */}
      <div style={{ background: "#FFFBFC", borderRadius: "12px", border: "1.5px solid #E8C4C4", overflow: "hidden" }}>
        {isLoading ? (
          <p style={{ padding: "32px", color: "#8A6A6A", textAlign: "center" }}>Loading reviews for moderation…</p>
        ) : !reviews.length ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <MessageSquare size={36} color="#8A6A6A" style={{ margin: "0 auto 12px" }} strokeWidth={1.25} />
            <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "#2C1A1A" }}>No {statusFilter || ""} reviews.</p>
            <p style={{ fontSize: "0.85rem", color: "#8A6A6A", marginTop: "6px" }}>
              {statusFilter === "pending"
                ? "All customer review submissions have been moderated."
                : "Customer reviews submitted for verified purchases will appear here."}
            </p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F9EEF2" }}>
                {["Item Context", "Rating", "Review Comment", "Status", "Submitted Date", "Actions"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "10px 16px",
                      fontSize: "0.72rem",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "#8A6A6A",
                      fontWeight: 600,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reviews.map((r: Record<string, unknown>, i: number) => {
                const listing = r.listings as { title: string; slug: string } | null;
                const isActLoading = loadingId === r.id;

                return (
                  <tr
                    key={r.id as string}
                    style={{ borderTop: "1px solid #F0DDE0", background: i % 2 === 0 ? "#fff" : "#FDF8F9" }}
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: "0.85rem", color: "#7D4757" }}>
                        {listing?.title || "Purchased Piece"}
                      </p>
                      <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#8A6A6A" }}>
                        ID: {(r.buyer_id as string).slice(0, 8)}
                      </p>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <StarRating rating={r.rating as number} />
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "0.85rem", color: "#2C1A1A", maxWidth: "340px" }}>
                      "{r.comment as string}"
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 10px",
                          borderRadius: "999px",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          background: r.status === "approved" ? "#7DA88A22" : r.status === "pending" ? "#E8B87A22" : "#C0808022",
                          color: r.status === "approved" ? "#3B7A4E" : r.status === "pending" ? "#C8882A" : "#C08080",
                          textTransform: "capitalize",
                        }}
                      >
                        {r.status as string}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "0.78rem", color: "#8A6A6A" }}>
                      {new Date(r.created_at as string).toLocaleDateString("en-PK", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {r.status === "pending" ? (
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            onClick={() => act(r.id as string, "approved")}
                            disabled={isActLoading}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "5px 10px",
                              borderRadius: "6px",
                              background: "#7DA88A",
                              border: "none",
                              color: "#fff",
                              fontWeight: 600,
                              fontSize: "0.75rem",
                              cursor: "pointer",
                            }}
                          >
                            <CheckCircle size={12} /> Approve
                          </button>
                          <button
                            onClick={() => act(r.id as string, "rejected")}
                            disabled={isActLoading}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "5px 10px",
                              borderRadius: "6px",
                              background: "#FDF2F2",
                              border: "1px solid #E5C3C3",
                              color: "#C0392B",
                              fontWeight: 600,
                              fontSize: "0.75rem",
                              cursor: "pointer",
                            }}
                          >
                            <XCircle size={12} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: "0.75rem", color: "#8A6A6A" }}>Moderated</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
