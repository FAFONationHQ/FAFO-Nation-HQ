import type { Metadata } from "next";
import PublicStatusPage from "../../components/PublicStatusPage";

export const metadata: Metadata = { title: "Start a Custom Project", description: "Current availability of future FAFO Custom Shop project submissions." };
export default function StartCustomProjectPage() { return <PublicStatusPage eyebrow="Custom Shop" title="Start a" accentTitle="Custom Project" introduction="This area is intended to become the starting point for approved custom-project ideas, references, sketches, and requirements." statusLabel="Submissions — Coming Later" statusText="The website does not currently accept project requests, files, personal information, quotes, payments, or production commitments." backHref="/custom-shop" backLabel="Return to Custom Shop" />; }
