/**
 * Standalone Contacts Page
 * For easy access to software team contacts
 */

import { SoftwareTeamContacts } from '../settings/SoftwareTeamContacts';

export function ContactsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <SoftwareTeamContacts />
      </div>
    </div>
  );
}
