// hooks/useOptimizedSWR.ts - Hooks SWR optimisés pour le BACK OFFICE
import useSWR from 'swr';
import { fetcherCustom } from '../components/apiFetcher';

// Configuration SWR pour le dashboard (données administratives - pas de cache)
export function useDashboardEvents(token: string) {
  return useSWR(
    token ? '/api/events' : null,
    (url) => fetcherCustom(url, token),
    {
      revalidateOnFocus: true, // Recharger à chaque focus pour les données admin
      revalidateOnReconnect: true,
      dedupingInterval: 0, // Pas de déduplication pour les données admin
      errorRetryCount: 3,
      refreshInterval: 0,
      keepPreviousData: false, // Pas de données précédentes pour les données critiques
    }
  );
}

// Configuration SWR pour les participants du back office (pas de cache)
export function useParticipantsBO(token: string) {
  return useSWR(
    token ? '/api/participants_bo' : null,
    (url) => fetcherCustom(url, token),
    {
      revalidateOnFocus: false, // ✅ Désactiver pour éviter duplications
      revalidateOnReconnect: false, // ✅ Désactiver pour éviter duplications
      dedupingInterval: 60000, // ✅ 1 minute de déduplication
      errorRetryCount: 1, // ✅ Limiter les tentatives
      refreshInterval: 0,
      keepPreviousData: true, // ✅ Garder les données précédentes
    }
  );
}

// Configuration SWR pour les participants d'un événement spécifique (back office)
export function useParticipantsByEventBO(eventId: string, token: string) {
  return useSWR(
    eventId && token ? `/api/participants_bo/event/${eventId}` : null,
    (url) => fetcherCustom(url, token),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 0,
      errorRetryCount: 3,
      refreshInterval: 0,
      keepPreviousData: false,
    }
  );
}

// Configuration SWR pour les tirages (données critiques - pas de cache)
export function useTiragesBO(eventId: string, token: string) {
  return useSWR(
    eventId && token ? `/api/tirage/event/${eventId}` : null,
    (url) => fetcherCustom(url, token),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 0,
      errorRetryCount: 3,
      refreshInterval: 0,
      keepPreviousData: false,
    }
  );
}

// Configuration SWR pour les vainqueurs (données critiques - pas de cache)
export function useVainqueursBO(eventId: string, token: string) {
  return useSWR(
    eventId && token ? `/api/vainqueurs/event/${eventId}` : null,
    (url) => fetcherCustom(url, token),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 0,
      errorRetryCount: 3,
      refreshInterval: 0,
      keepPreviousData: false,
    }
  );
}

// Configuration SWR pour les statistiques (cache modéré)
export function useStatisticsBO(token: string) {
  return useSWR(
    token ? '/api/events/event_participants' : null,
    (url) => fetcherCustom(url, token),
    {
      revalidateOnFocus: false, // ✅ Désactiver pour éviter duplications
      revalidateOnReconnect: false, // ✅ Désactiver pour éviter duplications
      dedupingInterval: 300000, // 5 minutes pour les stats
      errorRetryCount: 1, // ✅ Limiter les tentatives
      refreshInterval: 0,
      keepPreviousData: true,
    }
  );
}

// Configuration SWR pour les tours (cache modéré)
export function useToursBO(token: string) {
  return useSWR(
    token ? '/api/tours' : null,
    (url) => fetcherCustom(url, token),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 1800000, // 30 minutes
      errorRetryCount: 2,
      refreshInterval: 0,
      keepPreviousData: true,
    }
  );
}

// Hook pour les données d'historique (cache modéré)
export function useHistoryData(eventId: string, token: string) {
  return useSWR(
    eventId && token ? `/api/tirage/historique/${eventId}` : null,
    (url) => fetcherCustom(url, token),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 600000, // 10 minutes
      errorRetryCount: 2,
      refreshInterval: 0,
      keepPreviousData: true,
    }
  );
}

// Utilitaires pour la gestion du cache SWR - BACK OFFICE
export const SWRConfigBO = {
  // Configuration pour les données administratives critiques
  admin: {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 0,
    errorRetryCount: 3,
    refreshInterval: 0,
    keepPreviousData: false,
  },
  
  // Configuration pour les données de référence
  reference: {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 1800000, // 30 minutes
    errorRetryCount: 2,
    refreshInterval: 0,
    keepPreviousData: true,
  },
  
  // Configuration pour les statistiques
  statistics: {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 300000, // 5 minutes
    errorRetryCount: 2,
    refreshInterval: 0,
    keepPreviousData: true,
  }
};

export default {
  useDashboardEvents,
  useParticipantsBO,
  useParticipantsByEventBO,
  useTiragesBO,
  useVainqueursBO,
  useStatisticsBO,
  useToursBO,
  useHistoryData,
  SWRConfigBO
};
