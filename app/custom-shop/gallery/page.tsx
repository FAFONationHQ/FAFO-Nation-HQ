import type { Metadata } from "next";
import PublicStatusPage from "../../components/PublicStatusPage";

export const metadata: Metadata = { title: "Custom Project Gallery", description: "Current status of the planned FAFO Custom Shop project gallery." };
export default function CustomGalleryPage() { return <PublicStatusPage eyebrow="Custom Shop" title="Previous Custom Work" accentTitle="Gallery" introduction="A portfolio foundation for approved Previous Custom Work. Displayed work will not imply that the exact item is currently available for general purchase." statusLabel="Gallery — Approval Required" statusText="No custom listings are published until their gallery or reserved-order intent is verified." backHref="/custom-shop" backLabel="Return to Custom Shop" />; }
