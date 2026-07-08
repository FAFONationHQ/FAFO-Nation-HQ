import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <section className="relative w-full h-[70vh] min-h-[500px]">
        <Image
          src="/assets/hero/hero-banner.jpg"
          alt="FAFO Nation"
          fill
          priority
          className="object-cover object-center"
        />
      </section>
    </main>
  );
}