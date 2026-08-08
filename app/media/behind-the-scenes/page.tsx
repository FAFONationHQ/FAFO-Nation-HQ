import type { Metadata } from "next";
import PublicStatusPage from "../../components/PublicStatusPage";
export const metadata: Metadata = { title: "Behind the Scenes", description: "Current status of future behind-the-scenes FAFO Nation content." };
export default function BehindScenesPage() { return <PublicStatusPage eyebrow="Media & Content" title="Behind the" accentTitle="Scenes" introduction="Behind the Scenes is intended to share approved glimpses of the people and work behind future FAFO Nation content and projects." statusLabel="Content — Coming Later" statusText="No production footage, staff profiles, schedules, project details, or unpublished work is currently available here." backHref="/media" backLabel="Return to Media" />; }
