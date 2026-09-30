import ContactHero from "@/components/contact/ContactHero";
import ContactChannels from "@/components/contact/ContactChannels";
import ContactVisitStore from "@/components/contact/ContactVisitStore";
import ContactHelp from "@/components/contact/ContactHelp";
import ContactCTA from "@/components/contact/ContactCTA";

import { createClient } from "@/lib/supabase/server";


export default async function ContactPage() {
  const supabase = await createClient();

const { data: settings, error } = await supabase
  .from("public_store_settings")
  .select("*")
  .maybeSingle();
console.log("APP SETTINGS DATA:", settings);
console.log("APP SETTINGS ERROR:", error);
  if (error) {
    console.error("Contact settings error:", error);
  }

  const fullAddress = [
    settings?.address_line_1,
    settings?.city,
    settings?.state,
    settings?.postal_code,
  ]
    .filter(Boolean)
    .join(", ");
console.log("Settings",settings);
  const hasBusinessHours =
    settings?.business_hours_enabled &&
    [
      settings?.monday_open,
      settings?.tuesday_open,
      settings?.wednesday_open,
      settings?.thursday_open,
      settings?.friday_open,
      settings?.saturday_open,
      settings?.sunday_open,
    ].some(Boolean);

  const contactData = {
    businessName:
      settings?.shop_name ||
      settings?.app_name ||
      "Vaishnavi Collections",

    phone:
      settings?.primary_phone ||
      "",

    whatsapp:
      settings?.whatsapp_number ||
      settings?.primary_phone ||
      "",

    instagram:
      settings?.instagram_enabled
        ? settings?.instagram_url || ""
        : "",

    address:
      fullAddress ||
      "Gali No. 32, Indira Park, Kailash Puri, Palam, New Delhi, Delhi, 110046",

    mapsUrl:
      settings?.google_business_url || "",

    hours:
      hasBusinessHours
        ? "Please contact us for today's store timings."
        : "Contact us for current store timings.",

    madeToOrderEnabled:
      settings?.order_preparation_enabled ?? false,

    madeToOrderMessage:
      settings?.order_preparation_enabled
        ? "Selected products can be prepared on order according to size, design and your requirements. Send us your requirement and we will be happy to discuss it with you."
        : "",

    panIndiaShipping:
      settings?.pan_india_shipping_enabled ?? false,
  };

  return (
    <main className="overflow-hidden bg-[#F8F6F1] text-[#0B1F3A]">
      <ContactHero data={contactData} />

      <ContactChannels data={contactData} />

      <ContactVisitStore data={contactData} />

      {contactData.madeToOrderEnabled && (
        <ContactHelp data={contactData} />
      )}

      <ContactCTA data={contactData} />
    </main>
  );
}