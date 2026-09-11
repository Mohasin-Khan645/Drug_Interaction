import React from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext';
import { hasPermission } from '../../constants/permissions';

/**
 * PermissionGuard Component
 * Granular Permission-Based Access Control (PBAC) Component.
 * Conditionally renders children if currentUser satisfies the requested permission(s).
 */
export default function PermissionGuard({
  permission,
  permissions = [],
  requireAll = false,
  fallback = null,
  children,
}) {
  const { currentUser } = useAuth();

  const requiredList = permission ? [permission, ...permissions] : permissions;

  if (!requiredList.length) {
    return <>{children}</>;
  }

  const isAuthorized = requireAll
    ? requiredList.every((p) => hasPermission(currentUser, p))
    : requiredList.some((p) => hasPermission(currentUser, p));

  if (!isAuthorized) {
    return fallback;
  }

  return <>{children}</>;
}

PermissionGuard.propTypes = {
  permission: PropTypes.string,
  permissions: PropTypes.arrayOf(PropTypes.string),
  requireAll: PropTypes.bool,
  fallback: PropTypes.node,
  children: PropTypes.node.isRequired,
};

