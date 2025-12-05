import React, { ReactNode } from 'react';
import { usePermissions } from '../../contexts/PermissionContext';
import { Button, ButtonProps } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface PermissionButtonProps extends ButtonProps {
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  tooltipMessage?: string;
  children: ReactNode;
}

/**
 * PermissionButton component
 * Disables button if user doesn't have the required permission(s)
 * Shows tooltip explaining why button is disabled
 * 
 * @example
 * <PermissionButton permission="admin.delete_users" tooltipMessage="You need delete permission">
 *   Delete User
 * </PermissionButton>
 */
export function PermissionButton({
  permission,
  permissions,
  requireAll = false,
  tooltipMessage = 'You do not have permission to perform this action',
  children,
  disabled,
  onClick,
  ...buttonProps
}: PermissionButtonProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  let hasAccess = false;

  if (permission) {
    // Single permission check
    hasAccess = hasPermission(permission);
  } else if (permissions && permissions.length > 0) {
    // Multiple permissions check
    if (requireAll) {
      hasAccess = hasAllPermissions(permissions);
    } else {
      hasAccess = hasAnyPermission(permissions);
    }
  } else {
    // No permission specified, allow access
    hasAccess = true;
  }

  const isDisabled = disabled || !hasAccess;

  const button = (
    <Button
      {...buttonProps}
      disabled={isDisabled}
      onClick={hasAccess ? onClick : undefined}
    >
      {children}
    </Button>
  );

  if (!hasAccess && tooltipMessage) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltipMessage}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
}

