import { getDatabase } from '@/db';
import { Goal, CreateGoalDTO, GoalDeposit, CreateGoalDepositDTO } from '@/types';
import { generateUUID } from '@/utils';

export const goalService = {
    // Create new goal
    async create(data: CreateGoalDTO): Promise<Goal> {
        const db = await getDatabase();
        const id = generateUUID();
        const now = new Date().toISOString();

        await db.runAsync(
            `INSERT INTO goals (id, name, target_amount, current_amount, deadline, icon, color, is_completed, created_at, updated_at)
       VALUES (?, ?, ?, 0, ?, ?, ?, 0, ?, ?)`,
            [
                id,
                data.name,
                data.target_amount,
                data.deadline,
                data.icon || 'target',
                data.color || '#6366F1',
                now,
                now,
            ]
        );

        return this.getById(id) as Promise<Goal>;
    },

    // Get all goals
    async getAll(includeCompleted: boolean = true): Promise<Goal[]> {
        const db = await getDatabase();

        let query = `SELECT * FROM goals`;
        if (!includeCompleted) {
            query += ` WHERE is_completed = 0`;
        }
        query += ` ORDER BY is_completed ASC, deadline ASC`;

        const result = await db.getAllAsync<Goal>(query);
        return result.map(row => ({
            ...row,
            is_completed: Boolean(row.is_completed),
        }));
    },

    // Get goal by ID
    async getById(id: string): Promise<Goal | null> {
        const db = await getDatabase();
        const result = await db.getFirstAsync<Goal>(
            `SELECT * FROM goals WHERE id = ?`,
            [id]
        );

        if (!result) return null;

        return {
            ...result,
            is_completed: Boolean(result.is_completed),
        };
    },

    // Update goal
    async update(id: string, data: Partial<CreateGoalDTO>): Promise<Goal> {
        const db = await getDatabase();
        const now = new Date().toISOString();

        const updates: string[] = ['updated_at = ?'];
        const params: any[] = [now];

        if (data.name) {
            updates.push('name = ?');
            params.push(data.name);
        }
        if (data.target_amount !== undefined) {
            updates.push('target_amount = ?');
            params.push(data.target_amount);
        }
        if (data.deadline) {
            updates.push('deadline = ?');
            params.push(data.deadline);
        }
        if (data.icon) {
            updates.push('icon = ?');
            params.push(data.icon);
        }
        if (data.color) {
            updates.push('color = ?');
            params.push(data.color);
        }

        params.push(id);
        await db.runAsync(
            `UPDATE goals SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        return this.getById(id) as Promise<Goal>;
    },

    // Delete goal
    async delete(id: string): Promise<void> {
        const db = await getDatabase();
        await db.runAsync(`DELETE FROM goals WHERE id = ?`, [id]);
    },

    // Add deposit to goal
    async addDeposit(data: CreateGoalDepositDTO): Promise<GoalDeposit> {
        const db = await getDatabase();
        const id = generateUUID();
        const now = new Date().toISOString();

        // Insert deposit
        await db.runAsync(
            `INSERT INTO goal_deposits (id, goal_id, amount, date, note, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [id, data.goal_id, data.amount, data.date, data.note || null, now]
        );

        // Update goal's current amount
        await db.runAsync(
            `UPDATE goals 
       SET current_amount = current_amount + ?,
           is_completed = CASE WHEN current_amount + ? >= target_amount THEN 1 ELSE 0 END,
           updated_at = ?
       WHERE id = ?`,
            [data.amount, data.amount, now, data.goal_id]
        );

        return this.getDepositById(id) as Promise<GoalDeposit>;
    },

    // Get deposit by ID
    async getDepositById(id: string): Promise<GoalDeposit | null> {
        const db = await getDatabase();
        return db.getFirstAsync<GoalDeposit>(
            `SELECT * FROM goal_deposits WHERE id = ?`,
            [id]
        );
    },

    // Get all deposits for a goal
    async getDeposits(goalId: string): Promise<GoalDeposit[]> {
        const db = await getDatabase();
        return db.getAllAsync<GoalDeposit>(
            `SELECT * FROM goal_deposits WHERE goal_id = ? ORDER BY date DESC`,
            [goalId]
        );
    },

    // Delete deposit (and update goal amount)
    async deleteDeposit(id: string): Promise<void> {
        const db = await getDatabase();

        // Get deposit amount
        const deposit = await this.getDepositById(id);
        if (!deposit) return;

        // Delete deposit
        await db.runAsync(`DELETE FROM goal_deposits WHERE id = ?`, [id]);

        // Update goal's current amount
        const now = new Date().toISOString();
        await db.runAsync(
            `UPDATE goals 
       SET current_amount = MAX(0, current_amount - ?),
           is_completed = CASE WHEN current_amount - ? >= target_amount THEN 1 ELSE 0 END,
           updated_at = ?
       WHERE id = ?`,
            [deposit.amount, deposit.amount, now, deposit.goal_id]
        );
    },

    // Get summary of all goals
    async getSummary(): Promise<{
        total_goals: number;
        completed_goals: number;
        total_target: number;
        total_saved: number;
    }> {
        const db = await getDatabase();

        const result = await db.getFirstAsync<{
            total_goals: number;
            completed_goals: number;
            total_target: number;
            total_saved: number;
        }>(
            `SELECT 
        COUNT(*) as total_goals,
        SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed_goals,
        COALESCE(SUM(target_amount), 0) as total_target,
        COALESCE(SUM(current_amount), 0) as total_saved
       FROM goals`
        );

        return result || {
            total_goals: 0,
            completed_goals: 0,
            total_target: 0,
            total_saved: 0,
        };
    },
};
