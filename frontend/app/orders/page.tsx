"use client";
import { withPageRequiredAuth } from '@/services/auth/withPageRequiredAuth';
import { UserRole } from '@/types/Role';
import Orders from '@/components/Orders';

export default withPageRequiredAuth(Orders, { roles: [UserRole.ADMIN, UserRole.USER, UserRole.SUPERVISOR] });
