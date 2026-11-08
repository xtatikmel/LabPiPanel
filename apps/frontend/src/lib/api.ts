/**
 * Base URL de la API del backend.
 *
 * - En desarrollo, Vite hace proxy de `/api` hacia el backend (ver vite.config.ts).
 * - En producción, el backend Flask sirve el frontend y la API en el mismo origen.
 * - Para despliegues separados, define VITE_API_BASE (ej. http://192.168.1.50:5000/api).
 */
const configuredBase = import.meta.env.VITE_API_BASE?.trim();

export const API_BASE =
  configuredBase && configuredBase.length > 0
    ? configuredBase.replace(/\/+$/, '')
    : '/api';
