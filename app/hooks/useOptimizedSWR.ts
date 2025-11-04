// hooks/useOptimizedSWR.ts - Hooks SWR optimisés pour le BACK OFFICE
import useSWR from 'swr';
import { useState, useEffect, useRef } from 'react';
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

// Configuration SWR pour les participants du back office (SANS CACHE)
export function useParticipantsBO(token: string) {
  return useSWR(
    token ? '/api/participants_bo' : null,
    (url) => fetcherCustom(url, token),
    {
      revalidateOnFocus: true, // Recharger à chaque focus
      revalidateOnReconnect: true, // Recharger à chaque reconnexion
      dedupingInterval: 0, // Pas de cache
      errorRetryCount: 3,
      refreshInterval: 0,
      keepPreviousData: false, // Pas de cache des données précédentes
    }
  );
}

// Configuration SWR pour les participants d'un événement spécifique (back office)
// ✅ OPTIMISÉ : Charge automatiquement toutes les pages en arrière-plan
export function useParticipantsByEventBO(eventId: string, token: string) {
  const [allParticipants, setAllParticipants] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const loadedPagesRef = useRef<Set<number>>(new Set());
  const isLoadingRef = useRef(false);
  const currentEventIdRef = useRef<string | null>(null);

  // Charger la première page pour obtenir le total et afficher immédiatement
  const { data: firstPageData, error, isLoading, mutate } = useSWR(
    eventId && token ? `/api/participants_bo/event/${eventId}?page=1&limit=50000` : null,
    (url) => fetcherCustom(url, token),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 0,
      errorRetryCount: 3,
      refreshInterval: 0,
      keepPreviousData: false,
      onSuccess: (data) => {
        // Réinitialiser quand on change d'événement
        if (data?.data?.participants) {
          // Si l'eventId a changé, réinitialiser complètement
          if (currentEventIdRef.current !== eventId) {
            currentEventIdRef.current = eventId;
            loadedPagesRef.current = new Set();
            isLoadingRef.current = false;
          }
          
          setAllParticipants(data.data.participants);
          setTotalCount(data.data.pagination?.total || 0);
          loadedPagesRef.current.add(1);
        }
      },
    }
  );

  // Réinitialiser quand l'eventId change
  useEffect(() => {
    if (currentEventIdRef.current !== eventId && eventId) {
      setAllParticipants([]);
      setTotalCount(0);
      setIsLoadingMore(false);
      loadedPagesRef.current = new Set();
      isLoadingRef.current = false;
      currentEventIdRef.current = eventId;
    }
  }, [eventId]);

  // Charger les pages restantes en arrière-plan
  useEffect(() => {
    if (!firstPageData?.data || !eventId || !token || currentEventIdRef.current !== eventId) {
      return;
    }

    const pagination = firstPageData.data.pagination;
    const total = pagination?.total || 0;
    const pages = pagination?.pages || 1;

    // Vérifier si on a déjà tout chargé
    const hasAllPages = loadedPagesRef.current.size >= pages;
    const hasAllParticipants = allParticipants.length >= total && total > 0;

    if (hasAllParticipants && hasAllPages) {
      setIsLoadingMore(false);
      return;
    }

    // Si plus d'une page ET qu'on n'a pas encore tout chargé ET qu'on n'est pas déjà en train de charger
    if (pages > 1 && !hasAllParticipants && !isLoadingRef.current) {
      isLoadingRef.current = true;
      setIsLoadingMore(true);
      
      const loadRemainingPages = async () => {
        try {
          // Utiliser un Map pour éviter les doublons basés sur l'ID
          const participantsMap = new Map();
          
          // Ajouter TOUS les participants déjà chargés
          allParticipants.forEach((p: any) => {
            participantsMap.set(p.id || `temp-${Math.random()}`, p);
          });

          // Charger les pages par batch de 5 pour accélérer le chargement
          const batchSize = 5;
          const pagesToLoad: number[] = [];
          
          // Identifier les pages à charger
          for (let page = 2; page <= pages; page++) {
            if (!loadedPagesRef.current.has(page)) {
              pagesToLoad.push(page);
            }
          }

          // Si aucune page à charger, arrêter
          if (pagesToLoad.length === 0) {
            isLoadingRef.current = false;
            setIsLoadingMore(false);
            return;
          }

          console.log(`📥 Chargement de ${pagesToLoad.length} pages supplémentaires (${total} participants au total)`);

          // Charger par batch
          for (let i = 0; i < pagesToLoad.length; i += batchSize) {
            const batch = pagesToLoad.slice(i, i + batchSize);
            const pagePromises = batch.map(page =>
              fetcherCustom(
                `/api/participants_bo/event/${eventId}?page=${page}&limit=50000`,
                token
              ).then(response => ({ page, response }))
            );

            try {
              const results = await Promise.all(pagePromises);
              
              results.forEach(({ page, response }) => {
                if (response?.data?.participants) {
                  response.data.participants.forEach((p: any) => {
                    participantsMap.set(p.id || `temp-${Math.random()}`, p);
                  });
                  loadedPagesRef.current.add(page);
                }
              });

              // Mettre à jour l'état après chaque batch pour voir la progression
              const updatedParticipants = Array.from(participantsMap.values());
              setAllParticipants(updatedParticipants);
              
              console.log(`✅ Pages ${batch.join(',')} chargées. Total: ${updatedParticipants.length}/${total}`);
              
              // Si on a atteint le total, arrêter
              if (updatedParticipants.length >= total) {
                break;
              }
            } catch (err) {
              console.error(`❌ Erreur lors du chargement des pages ${batch.join(',')}:`, err);
            }
          }
          
          isLoadingRef.current = false;
          setIsLoadingMore(false);
          const finalCount = Array.from(participantsMap.values()).length;
          console.log(`✅ Chargement terminé: ${finalCount}/${total} participants`);
        } catch (err) {
          console.error('❌ Erreur lors du chargement des pages restantes:', err);
          isLoadingRef.current = false;
          setIsLoadingMore(false);
        }
      };

      // Démarrer le chargement immédiatement (pas de timeout pour accélérer)
      loadRemainingPages();
      
      return () => {
        // Ne pas arrêter le chargement en cours, juste marquer qu'on peut relancer
        // isLoadingRef.current = false;
      };
    } else {
      setIsLoadingMore(false);
    }
  }, [firstPageData?.data, eventId, token, allParticipants.length]);

  // Retourner les données avec tous les participants
  return {
    data: firstPageData?.data ? {
      ...firstPageData.data,
      participants: allParticipants,
      pagination: {
        ...firstPageData.data.pagination,
        // CORRECTION : Utiliser le total de la pagination de l'API (pas totalCount qui peut être 0 au début)
        total: firstPageData.data.pagination?.total || totalCount || allParticipants.length,
        loaded: allParticipants.length,
        isLoadingMore,
      }
    } : null,
    error,
    isLoading: isLoading && allParticipants.length === 0,
    isLoadingMore,
    mutate,
  };
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

// Configuration SWR pour les statistiques (SANS CACHE)
export function useStatisticsBO(token: string) {
  return useSWR(
    token ? '/api/events/event_participants' : null,
    (url) => fetcherCustom(url, token),
    {
      revalidateOnFocus: true, // Recharger à chaque focus
      revalidateOnReconnect: true, // Recharger à chaque reconnexion
      dedupingInterval: 0, // Pas de cache
      errorRetryCount: 3,
      refreshInterval: 0,
      keepPreviousData: false, // Pas de cache des données précédentes
    }
  );
}

// Configuration SWR pour les tours (SANS CACHE)
export function useToursBO(token: string) {
  return useSWR(
    token ? '/api/tours' : null,
    (url) => fetcherCustom(url, token),
    {
      revalidateOnFocus: true, // Recharger à chaque focus
      revalidateOnReconnect: true, // Recharger à chaque reconnexion
      dedupingInterval: 0, // Pas de cache
      errorRetryCount: 3,
      refreshInterval: 0,
      keepPreviousData: false, // Pas de cache des données précédentes
    }
  );
}

// Hook pour les données d'historique (SANS CACHE)
export function useHistoryData(eventId: string, token: string) {
  return useSWR(
    eventId && token ? `/api/tirage/historique/${eventId}` : null,
    (url) => fetcherCustom(url, token),
    {
      revalidateOnFocus: true, // Recharger à chaque focus
      revalidateOnReconnect: true, // Recharger à chaque reconnexion
      dedupingInterval: 0, // Pas de cache
      errorRetryCount: 3,
      refreshInterval: 0,
      keepPreviousData: false, // Pas de cache des données précédentes
    }
  );
}

// Utilitaires pour la configuration SWR - SANS CACHE
export const SWRConfigBO = {
  // Configuration pour les données administratives critiques (SANS CACHE)
  admin: {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 0, // Pas de cache
    errorRetryCount: 3,
    refreshInterval: 0,
    keepPreviousData: false, // Pas de cache
  },
  
  // Configuration pour les données de référence (SANS CACHE)
  reference: {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 0, // Pas de cache
    errorRetryCount: 3,
    refreshInterval: 0,
    keepPreviousData: false, // Pas de cache
  },
  
  // Configuration pour les statistiques (SANS CACHE)
  statistics: {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 0, // Pas de cache
    errorRetryCount: 3,
    refreshInterval: 0,
    keepPreviousData: false, // Pas de cache
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
