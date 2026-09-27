import { SettingsPage } from "@/components/admin/settings/settings-page";
import { getAppSettings } from "@/lib/settings/queries";


export const metadata = {
  title: "Settings | Vaishnavi Collections",
};

export default async function AdminSettingsPage() {
  const settings = await getAppSettings();

  if (!settings) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Unable to load settings
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Please refresh the page and try again.
          </p>
        </div>
      </div>
    );
  }

  return <SettingsPage initialSettings={settings} />;
}