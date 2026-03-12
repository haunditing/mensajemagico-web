import AdminCampaignGenerator from "../components/social/AdminCampaignGenerator";
import { useAuth } from "../context/AuthContext";

export default function AdminCampaignPage() {
  const { user } = useAuth();
  if (!user || user.role !== "admin") return null;
  return <AdminCampaignGenerator />;
}
