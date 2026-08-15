import type { Metadata } from "next";
import PublicStatusPage from "../../components/PublicStatusPage";

export const metadata: Metadata = { title: "Custom Project Status", description: "Current availability of future FAFO Custom Shop project-status access." };
export default function CustomStatusPage() { return <PublicStatusPage eyebrow="Custom Shop" title="Project" accentTitle="Status" introduction="Project Status is intended to provide secure future access to updates for an active custom project." statusLabel="Status Access — Coming Later" statusText="No status lookup, customer account, project identifier, order record, or private project information is available through the website." backHref="/custom-shop" backLabel="Return to Custom Shop" />; }
