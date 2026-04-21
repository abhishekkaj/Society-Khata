import { create } from 'zustand';
import { Society, Member, DashboardMetrics } from '../types';
import { dbService } from '../database/DatabaseService';

interface KhataState {
  activeSociety: Society | null;
  members: Member[];
  metrics: DashboardMetrics;
  
  // Actions
  initialize: () => void;
  createDefaultSociety: (name: string, defaultAmount: number) => void;
  addMemberOptimistic: (name: string, flat_number: string, phone: string) => void;
  markPaidOptimistic: (memberId: number, amount: number, mode: 'UPI' | 'CASH') => void;
}

const defaultMetrics: DashboardMetrics = { totalCollected: 0, totalPending: 0, paidPercentage: 0 };

export const useStore = create<KhataState>((set, get) => ({
  activeSociety: null,
  members: [],
  metrics: defaultMetrics,

  initialize: () => {
    // In a real app we would query 'SELECT * FROM societies LIMIT 1'
    // For now we leave it empty since we mock setup in DashboardScreen
  },

  createDefaultSociety: (name, defaultAmount) => {
    try {
      const society = dbService.getOrCreateSociety(name, defaultAmount);
      set({ activeSociety: society, members: [], metrics: defaultMetrics });
    } catch (e) {
      console.error('Failed to create society', e);
    }
  },

  addMemberOptimistic: (name, flat_number, phone) => {
    const { activeSociety, members } = get();
    if (!activeSociety) return;

    // 1. Optimistic UI Update: Create a temporary member
    const tempId = Date.now();
    const tempMember: Member = {
      id: tempId,
      society_id: activeSociety.id,
      name,
      flat_number,
      phone,
      is_paid: 0,
    };

    set((state) => {
      // Recompute pending metrics optimistically
      const newMetrics = { ...state.metrics, totalPending: state.metrics.totalPending + activeSociety.default_amount };
      const newPaidPercentage = (state.members.filter(m => m.is_paid).length / (state.members.length + 1)) * 100;
      return { 
        members: [...state.members, tempMember],
        metrics: { ...newMetrics, paidPercentage: newPaidPercentage }
      };
    });

    // 2. Background Sync
    setTimeout(() => {
      try {
        const realMember = dbService.addMember(activeSociety.id, name, flat_number, phone);
        // Swap temp ID with real ID
        set((state) => ({
          members: state.members.map(m => m.id === tempId ? realMember : m)
        }));
      } catch (error) {
        // Silent rollback on error
        set({ members });
      }
    }, 0);
  },

  markPaidOptimistic: (memberId, amount, mode) => {
    const { members, activeSociety, metrics } = get();
    if (!activeSociety) return;

    // 1. Optimistic UI Update
    set((state) => {
      const updatedMembers = state.members.map(m => 
        m.id === memberId ? { ...m, is_paid: 1 } : m
      );
      const paidCount = updatedMembers.filter(m => m.is_paid === 1).length;
      const totalCount = updatedMembers.length;
      
      const newMetrics: DashboardMetrics = {
        totalCollected: state.metrics.totalCollected + amount,
        totalPending: Math.max(0, state.metrics.totalPending - amount),
        paidPercentage: totalCount === 0 ? 0 : (paidCount / totalCount) * 100
      };

      return { members: updatedMembers, metrics: newMetrics };
    });

    // 2. Background Sync
    setTimeout(() => {
      try {
        dbService.addPayment(memberId, amount, mode);
      } catch (error) {
        // Rollback on failure
        set({ members, metrics });
      }
    }, 0);
  }
}));
