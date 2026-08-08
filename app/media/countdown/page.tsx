import type { Metadata } from "next";
import PublicStatusPage from "../../components/PublicStatusPage";
export const metadata: Metadata = { title: "Livestream Countdown", description: "Current status of future FAFO Nation livestream countdown information." };
export default function CountdownPage() { return <PublicStatusPage eyebrow="Media & Content" title="Livestream" accentTitle="Countdown" introduction="This area is intended to publish approved timing and details for an upcoming FAFO Nation livestream." statusLabel="No Countdown Scheduled" statusText="No stream date, start time, timezone, live status, or schedule is currently approved for publication." backHref="/media/live" backLabel="View Live Stream Access" />; }
