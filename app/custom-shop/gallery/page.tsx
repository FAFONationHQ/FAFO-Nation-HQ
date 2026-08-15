import type { Metadata } from "next";
import PublicStatusPage from "../../components/PublicStatusPage";

export const metadata: Metadata = { title: "Custom Project Gallery", description: "Current status of the planned FAFO Custom Shop project gallery." };
export default function CustomGalleryPage() { return <PublicStatusPage eyebrow="Custom Shop" title="Custom Project" accentTitle="Gallery" introduction="The Custom Project Gallery is intended to share approved completed work and provide inspiration for future FAFO custom projects." statusLabel="Gallery — Coming Later" statusText="No customer projects, submissions, testimonials, ownership claims, or completed-work records are currently approved for publication." backHref="/custom-shop" backLabel="Return to Custom Shop" />; }
