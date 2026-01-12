import { create } from 'zustand';
import { Goal, CreateGoalDTO, GoalDeposit, CreateGoalDepositDTO } from '@/types';
import { goalService } from '@/services';

interface GoalState {
    // Data
    goals: Goal[];
    selectedGoal: Goal | null;
    deposits: GoalDeposit[];

    // Summary
    totalGoals: number;
    completedGoals: number;
    totalTarget: number;
    totalSaved: number;

    // State
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchGoals: (includeCompleted?: boolean) => Promise<void>;
    fetchGoal: (id: string) => Promise<void>;
    fetchDeposits: (goalId: string) => Promise<void>;
    fetchSummary: () => Promise<void>;
    addGoal: (data: CreateGoalDTO) => Promise<Goal>;
    updateGoal: (id: string, data: Partial<CreateGoalDTO>) => Promise<void>;
    deleteGoal: (id: string) => Promise<void>;
    addDeposit: (data: CreateGoalDepositDTO) => Promise<GoalDeposit>;
    deleteDeposit: (id: string) => Promise<void>;
    clearSelectedGoal: () => void;
    refreshAll: () => Promise<void>;
}

export const useGoalStore = create<GoalState>((set, get) => ({
    // Initial state
    goals: [],
    selectedGoal: null,
    deposits: [],
    totalGoals: 0,
    completedGoals: 0,
    totalTarget: 0,
    totalSaved: 0,
    isLoading: false,
    error: null,

    // Fetch all goals
    fetchGoals: async (includeCompleted = true) => {
        set({ isLoading: true, error: null });
        try {
            const goals = await goalService.getAll(includeCompleted);
            set({ goals, isLoading: false });
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    // Fetch single goal
    fetchGoal: async (id: string) => {
        try {
            const goal = await goalService.getById(id);
            set({ selectedGoal: goal });
        } catch (error) {
            console.error('Error fetching goal:', error);
        }
    },

    // Fetch deposits for a goal
    fetchDeposits: async (goalId: string) => {
        try {
            const deposits = await goalService.getDeposits(goalId);
            set({ deposits });
        } catch (error) {
            console.error('Error fetching deposits:', error);
        }
    },

    // Fetch summary
    fetchSummary: async () => {
        try {
            const summary = await goalService.getSummary();
            set({
                totalGoals: summary.total_goals,
                completedGoals: summary.completed_goals,
                totalTarget: summary.total_target,
                totalSaved: summary.total_saved,
            });
        } catch (error) {
            console.error('Error fetching goal summary:', error);
        }
    },

    // Add new goal
    addGoal: async (data: CreateGoalDTO) => {
        set({ isLoading: true, error: null });
        try {
            const goal = await goalService.create(data);
            await get().refreshAll();
            set({ isLoading: false });
            return goal;
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
            throw error;
        }
    },

    // Update goal
    updateGoal: async (id: string, data: Partial<CreateGoalDTO>) => {
        set({ isLoading: true, error: null });
        try {
            await goalService.update(id, data);
            await get().refreshAll();
            if (get().selectedGoal?.id === id) {
                await get().fetchGoal(id);
            }
            set({ isLoading: false });
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
            throw error;
        }
    },

    // Delete goal
    deleteGoal: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            await goalService.delete(id);
            await get().refreshAll();
            if (get().selectedGoal?.id === id) {
                set({ selectedGoal: null, deposits: [] });
            }
            set({ isLoading: false });
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
            throw error;
        }
    },

    // Add deposit to goal
    addDeposit: async (data: CreateGoalDepositDTO) => {
        set({ isLoading: true, error: null });
        try {
            const deposit = await goalService.addDeposit(data);

            // Fetch all updated data
            const [updatedGoal, updatedDeposits, allGoals, summary] = await Promise.all([
                goalService.getById(data.goal_id),
                goalService.getDeposits(data.goal_id),
                goalService.getAll(true),
                goalService.getSummary(),
            ]);

            set({
                selectedGoal: updatedGoal,
                deposits: updatedDeposits,
                goals: allGoals,
                totalGoals: summary.total_goals,
                completedGoals: summary.completed_goals,
                totalTarget: summary.total_target,
                totalSaved: summary.total_saved,
                isLoading: false
            });

            return deposit;
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
            throw error;
        }
    },

    // Delete deposit
    deleteDeposit: async (id: string) => {
        const deposit = get().deposits.find(d => d.id === id);
        if (!deposit) return;

        set({ isLoading: true, error: null });
        try {
            await goalService.deleteDeposit(id);

            // Refresh goal and deposits
            await get().fetchGoal(deposit.goal_id);
            await get().fetchDeposits(deposit.goal_id);
            await get().fetchSummary();

            set({ isLoading: false });
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
            throw error;
        }
    },

    // Clear selected goal
    clearSelectedGoal: () => {
        set({ selectedGoal: null, deposits: [] });
    },

    // Refresh all data
    refreshAll: async () => {
        await Promise.all([
            get().fetchGoals(),
            get().fetchSummary(),
        ]);
    },
}));
