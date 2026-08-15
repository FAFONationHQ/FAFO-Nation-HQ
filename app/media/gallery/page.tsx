import type { Metadata } from "next";
import PublicStatusPage from "../../components/PublicStatusPage";
export const metadata: Metadata = { title: "Media Gallery", description: "Current status of the planned FAFO Nation photo, artwork, and visual-media gallery." };
export default function GalleryPage() { return <PublicStatusPage eyebrow="Media & Content" title="Media" accentTitle="Gallery" introduction="The Media Gallery is intended to present approved FAFO Nation photos, artwork, and visual media." statusLabel="Gallery — Coming Later" statusText="No creator submissions, event photography, customer media, artwork credits, or licensing claims are currently published." backHref="/media" backLabel="Return to Media" />; }
