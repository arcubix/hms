/**
 * Add User Page
 * Wrapper page for AddUser component
 */

import { AddUser } from '../modules/AddUser';

interface AddUserPageProps {
  userId?: number; // For editing existing user
  onBack: () => void;
  onSuccess?: () => void;
}

export function AddUserPage({ userId, onBack, onSuccess }: AddUserPageProps) {
  return (
    <AddUser
      onBack={onBack}
      onSuccess={onSuccess || onBack}
      userId={userId}
    />
  );
}

