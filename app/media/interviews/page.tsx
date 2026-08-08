import type { Metadata } from "next";
import PublicStatusPage from "../../components/PublicStatusPage";
export const metadata: Metadata = { title: "Interview Series", description: "Current status of the planned FAFO Nation interview series." };
export default function InterviewsPage() { return <PublicStatusPage eyebrow="Media & Content" title="Interview" accentTitle="Series" introduction="The Interview Series is intended to share approved conversations and perspectives through FAFO Nation media." statusLabel="No Interviews Published" statusText="No guests, episodes, recordings, quotes, release dates, or interview schedule is currently available." backHref="/media" backLabel="Return to Media" />; }
