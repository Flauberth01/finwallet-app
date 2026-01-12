// Goal type
export interface Goal {
    id: string;
    name: string;
    target_amount: number; // Value in cents
    current_amount: number; // Value in cents
    deadline: string; // ISO date string
    icon: string; // Lucide icon name
    color: string; // Hex color
    is_completed: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateGoalDTO {
    name: string;
    target_amount: number;
    deadline: string;
    icon?: string;
    color?: string;
}

export interface GoalDeposit {
    id: string;
    goal_id: string;
    amount: number;
    date: string;
    note?: string;
    created_at: string;
}

export interface CreateGoalDepositDTO {
    goal_id: string;
    amount: number;
    date: string;
    note?: string;
}
