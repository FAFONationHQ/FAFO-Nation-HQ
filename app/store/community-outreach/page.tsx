import type { Metadata } from "next";
import PublicStatusPage from "../../components/PublicStatusPage";
export const metadata: Metadata = { title: "Community Outreach Lines", description: "Current status of future FAFO Nation community-outreach merchandise." };
export default function OutreachStorePage() { return <PublicStatusPage eyebrow="FAFO Gear" title="Community Outreach" accentTitle="Lines" introduction="This category is intended for approved merchandise connected to future community-outreach initiatives." statusLabel="No Outreach Line Published" statusText="No initiative, beneficiary, partnership, donation amount, product, price, availability, or impact claim is currently published." backHref="/store" backLabel="Return to Store" />; }
