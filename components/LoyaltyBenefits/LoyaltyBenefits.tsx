import Link from "next/link";
import { ArrowRight, Gift, PackageCheck, Share2, Sparkles, Star } from "lucide-react";

const benefits = [
  { title: "1 Stamp = ₹500", detail: "Earn stamps on every purchase", icon: Star },
  { title: "First Order", detail: "Get 10% off", icon: Gift },
  { title: "Made to Order", detail: "Personalised products", icon: PackageCheck },
  { title: "Refer & Earn", detail: "Share with your friends", icon: Share2 },
  { title: "Follow Us", detail: "Get exclusive updates", icon: Sparkles },
];

export default function LoyaltyBenefits() {
  return (
    <section className="relative overflow-hidden bg-[#0b1d36] px-4 py-10 text-white sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#e2b657]">Exclusive benefits</p>
          <h2 className="mt-1 font-serif text-2xl font-semibold">Shop more. Earn more.</h2>
          <p className="mt-2 text-xs text-white/70">Our loyalty program adds more joy to your shopping.</p>
        </div>
        <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {benefits.map(({ title, detail, icon: Icon }) => (
            <div key={title} className="flex flex-col items-center border-white/20 px-2 text-center sm:border-r last:border-0">
              <span className="grid size-10 place-items-center rounded-full border border-[#d6a943] text-[#e2b657]"><Icon size={17} /></span>
              <h3 className="mt-2 text-xs font-semibold">{title}</h3>
              <p className="mt-1 text-[10px] leading-4 text-white/65">{detail}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link href="/contact" className="inline-flex items-center gap-2 rounded-lg bg-[#e2b657] px-4 py-2 text-xs font-semibold text-[#10233e] transition hover:bg-[#f0c96f]">View loyalty program <ArrowRight size={14} /></Link>
        </div>
      </div>
    </section>
  );
}
