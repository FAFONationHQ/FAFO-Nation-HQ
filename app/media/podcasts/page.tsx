import type { Metadata } from "next";
import PublicStatusPage from "../../components/PublicStatusPage";
export const metadata: Metadata = { title: "Podcasts", description: "Current status of planned FAFO Nation podcast content." };
export default function PodcastsPage() { return <PublicStatusPage eyebrow="Media & Content" title="FAFO Nation" accentTitle="Podcasts" introduction="This area is intended to become a public destination for approved FAFO Nation podcast content." statusLabel="No Episodes Published" statusText="No podcast title, host, guest, episode, feed, platform, release date, or publication schedule is currently available." backHref="/media" backLabel="Return to Media" />; }
