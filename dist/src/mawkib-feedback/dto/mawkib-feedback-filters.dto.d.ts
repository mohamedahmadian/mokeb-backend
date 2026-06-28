export declare class MawkibFeedbackFiltersDto {
    search?: string;
    mawkibId?: number;
    authorUserId?: number;
    replyStatus?: 'all' | 'replied' | 'pending';
    createdFrom?: string;
    createdTo?: string;
}
