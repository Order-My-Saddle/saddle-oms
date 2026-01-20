"use client";
import { withPageRequiredAuth } from '@/services/auth/withPageRequiredAuth';
import { UserRole } from '@/types/Role';
import Reports from '@/components/Reports';

export default withPageRequiredAuth(Reports, { roles: [UserRole.ADMIN, UserRole.SUPERVISOR] });
