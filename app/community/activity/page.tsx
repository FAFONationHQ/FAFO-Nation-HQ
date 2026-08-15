import type { Metadata } from "next";
import PublicStatusPage from "../../components/PublicStatusPage";

export const metadata: Metadata = { title: "Community Activity", description: "Current status of the planned FAFO Nation community activity area." };
export default function CommunityActivityPage() { return <PublicStatusPage eyebrow="Community" title="Community" accentTitle="Activity" introduction="Community Activity is intended to provide a public view of approved participation and updates from across the Nation." statusLabel="Activity Feed — Coming Later" statusText="No member activity feed, submissions, posts, reactions, or account-driven updates are currently available. Future public activity will require moderation, consent, and account controls." backHref="/community" backLabel="Return to Community" />; }
