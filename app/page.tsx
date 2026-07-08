import Image from "next/image";
import heroBanner from "../assets/hero/hero-banner.jpg";

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <section className="relative w-full h-[70vh] min-h-[500px]">
        <Image
          
          alt="FAFO Nation"
          fill
  src={heroBanner}        priority
          className="object-cover object-center"
        />
      </section>
    </main>
  );
}