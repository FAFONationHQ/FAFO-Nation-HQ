import type { Metadata } from "next";
import PublicStatusPage from "../../components/PublicStatusPage";
export const metadata: Metadata = { title: "FAFO Featured Artist", description: "Current status of the planned FAFO Nation featured-artist area." };
export default function FeaturedArtistPage() { return <PublicStatusPage eyebrow="Media & Content" title="FAFO Featured" accentTitle="Artist" introduction="FAFO Featured Artist is intended to introduce approved artists and creative work connected to future FAFO Nation content." statusLabel="No Artist Feature Published" statusText="No artist partnership, biography, artwork, release, endorsement, compensation arrangement, or publication date is currently represented." backHref="/media" backLabel="Return to Media" />; }
