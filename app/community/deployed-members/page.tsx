import type { Metadata } from "next";
import PublicStatusPage from "../../components/PublicStatusPage";

export const metadata: Metadata = { title: "Deployed Members", description: "Current status of planned voluntary public FAFO Nation member visibility." };
export default function DeployedMembersPage() { return <PublicStatusPage eyebrow="Global Community" title="Deployed" accentTitle="Members" introduction="Deployed Members is intended to recognize FAFO Nation members who choose to participate publicly while keeping member presence separate from merchandise deployments." statusLabel="Voluntary Visibility — Coming Later" statusText="No public member directory is currently available. Future visibility requires accounts, explicit consent, privacy controls, moderation, and member-controlled removal." backHref="/community" backLabel="Return to Community" />; }
