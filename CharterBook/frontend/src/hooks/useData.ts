import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api';

export const useFleet = () => {
    return useQuery({
        queryKey: ['fleet'],
        queryFn: api.fetchFleet,
    });
};

export const useCrew = () => {
    return useQuery({
        queryKey: ['crew'],
        queryFn: api.fetchCrew,
    });
};

export const useFlights = () => {
    return useQuery({
        queryKey: ['flights'],
        queryFn: api.fetchFlights,
    });
};

export const useClients = () => {
    return useQuery({
        queryKey: ['clients'],
        queryFn: api.fetchClients,
    });
};

export const useTrips = () => {
    return useQuery({
        queryKey: ['trips'],
        queryFn: api.fetchTrips,
    });
};

export const useComplianceFlights = () => {
    return useQuery({
        queryKey: ['compliance'],
        queryFn: api.fetchComplianceFlights,
    });
};

export const useADItems = () => {
    return useQuery({
        queryKey: ['ads'],
        queryFn: api.fetchADItems,
    });
};

export const useEmptyLegs = () => {
    return useQuery({
        queryKey: ['legs'],
        queryFn: api.fetchEmptyLegs,
    });
};

export const useRates = () => {
    return useQuery({
        queryKey: ['rates'],
        queryFn: api.fetchRates,
    });
};

export const useDistances = () => {
    return useQuery({
        queryKey: ['distances'],
        queryFn: api.fetchDistances,
    });
};

export const useFuelBurn = () => {
    return useQuery({
        queryKey: ['fuelBurn'],
        queryFn: api.fetchFuelBurn,
    });
};

// --- Mutations ---

export const useUpdateChecklist = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ itemId, status, remarks }: { itemId: string; status: string; remarks?: string }) =>
            api.updateChecklistItem(itemId, status, remarks),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['compliance'] });
        },
    });
};

export const useAddClientNote = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ clientId, note }: { clientId: string; note: any }) =>
            api.addClientNote(clientId, note),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
        },
    });
};

export const useUpdateFlightStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ flightId, status }: { flightId: string; status: string }) =>
            api.updateFlightStatus(flightId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['flights'] });
            queryClient.invalidateQueries({ queryKey: ['trips'] });
            queryClient.invalidateQueries({ queryKey: ['compliance'] });
        },
    });
};

export const useReassignAircraft = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ flightId, aircraftId }: { flightId: string; aircraftId: string }) =>
            api.reassignAircraft(flightId, aircraftId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['flights'] });
        },
    });
};

export const useAssignCrew = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ flightId, role, crewId }: { flightId: string; role: string; crewId: string }) =>
            api.assignCrew(flightId, role, crewId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['flights'] });
        },
    });
};

export const useFlight = (id: string, options?: any) => {
    return useQuery({
        queryKey: ['flight', id],
        queryFn: () => api.fetchFlight(id),
        ...options,
    });
};

export const useUpdateFlight = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => api.updateFlight(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['flights'] });
            queryClient.invalidateQueries({ queryKey: ['flight', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['trips'] });
        },
    });
};

export const useCreateFlight = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (flightData: any) => api.createFlight(flightData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['flights'] });
            queryClient.invalidateQueries({ queryKey: ['trips'] });
        },
    });
};

export const useCreateClient = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (clientData: any) => api.createClient(clientData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
        },
    });
};
