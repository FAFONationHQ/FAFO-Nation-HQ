import type { Metadata } from "next";
import PublicStatusPage from "../../components/PublicStatusPage";
export const metadata: Metadata = { title: "News & Updates", description: "Current status of future FAFO Nation news and public updates." };
export default function NewsPage() { return <PublicStatusPage eyebrow="Media & Content" title="News &" accentTitle="Updates" introduction="News & Updates is intended to become the public record of approved FAFO Nation announcements and website updates." statusLabel="No News Posts Published" statusText="No announcement, release, event, partnership, operational update, or publication date is currently available in this area." backHref="/media" backLabel="Return to Media" />; }
