# npm Organization Hierarchy

## Overview
- **Organizations:** Define org configuration and user roles.
- **Users:** Members contained within the organization.
- **Scoped Namespace:** Contains the organization's packages.
- **Packages:** Defined by publishing access configuration.
- **Teams:** At least one team is required per organization.

## Member Roles & Permissions
- **Owner:** Full management access, including billing and members.
- **Admin:** Can manage members and teams.
- **Member:** General access level.
- **Package Access:** Can be set to "read" or "read/write".

## Security (Publishing Access)
- **2FA Enforcement:** Highly recommended to require Two-Factor Authentication for adding another level of security to packages.
