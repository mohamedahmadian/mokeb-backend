import type { AuthUser } from '../common/decorators/current-user.decorator';
import { MawkibFeedbackService } from './mawkib-feedback.service';
import { CreateMawkibFeedbackDto } from './dto/create-mawkib-feedback.dto';
import { MawkibFeedbackFiltersDto } from './dto/mawkib-feedback-filters.dto';
import { ReplyMawkibFeedbackDto } from './dto/reply-mawkib-feedback.dto';
import { UpdateMawkibFeedbackDto } from './dto/update-mawkib-feedback.dto';
export declare class MawkibFeedbackController {
    private service;
    constructor(service: MawkibFeedbackService);
    create(dto: CreateMawkibFeedbackDto, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            name: string;
            phoneNumber: string;
            mawkibCity: import("@prisma/client").$Enums.MawkibCity | null;
            owner: {
                id: number;
                mobileNumber: string;
                fullName: string;
            };
        };
        author: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
        repliedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        mawkibId: number;
        updatedAt: Date;
        authorUserId: number;
        content: string;
        repliedAt: Date | null;
        repliedByUserId: number | null;
        ownerReply: string | null;
    }>;
    findAllAdmin(filters: MawkibFeedbackFiltersDto): Promise<({
        mawkib: {
            id: number;
            name: string;
            phoneNumber: string;
            mawkibCity: import("@prisma/client").$Enums.MawkibCity | null;
            owner: {
                id: number;
                mobileNumber: string;
                fullName: string;
            };
        };
        author: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
        repliedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        mawkibId: number;
        updatedAt: Date;
        authorUserId: number;
        content: string;
        repliedAt: Date | null;
        repliedByUserId: number | null;
        ownerReply: string | null;
    })[]>;
    findMine(filters: MawkibFeedbackFiltersDto, user: AuthUser): Promise<({
        mawkib: {
            id: number;
            name: string;
            phoneNumber: string;
            mawkibCity: import("@prisma/client").$Enums.MawkibCity | null;
            owner: {
                id: number;
                mobileNumber: string;
                fullName: string;
            };
        };
        author: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
        repliedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        mawkibId: number;
        updatedAt: Date;
        authorUserId: number;
        content: string;
        repliedAt: Date | null;
        repliedByUserId: number | null;
        ownerReply: string | null;
    })[]>;
    findForOwner(filters: MawkibFeedbackFiltersDto, user: AuthUser): Promise<({
        mawkib: {
            id: number;
            name: string;
            phoneNumber: string;
            mawkibCity: import("@prisma/client").$Enums.MawkibCity | null;
            owner: {
                id: number;
                mobileNumber: string;
                fullName: string;
            };
        };
        author: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
        repliedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        mawkibId: number;
        updatedAt: Date;
        authorUserId: number;
        content: string;
        repliedAt: Date | null;
        repliedByUserId: number | null;
        ownerReply: string | null;
    })[]>;
    findOne(id: number, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            name: string;
            phoneNumber: string;
            mawkibCity: import("@prisma/client").$Enums.MawkibCity | null;
            owner: {
                id: number;
                mobileNumber: string;
                fullName: string;
            };
        };
        author: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
        repliedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        mawkibId: number;
        updatedAt: Date;
        authorUserId: number;
        content: string;
        repliedAt: Date | null;
        repliedByUserId: number | null;
        ownerReply: string | null;
    }>;
    updateOwn(id: number, dto: UpdateMawkibFeedbackDto, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            name: string;
            phoneNumber: string;
            mawkibCity: import("@prisma/client").$Enums.MawkibCity | null;
            owner: {
                id: number;
                mobileNumber: string;
                fullName: string;
            };
        };
        author: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
        repliedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        mawkibId: number;
        updatedAt: Date;
        authorUserId: number;
        content: string;
        repliedAt: Date | null;
        repliedByUserId: number | null;
        ownerReply: string | null;
    }>;
    deleteOwn(id: number, user: AuthUser): Promise<{
        id: number;
        message: string;
    }>;
    reply(id: number, dto: ReplyMawkibFeedbackDto, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            name: string;
            phoneNumber: string;
            mawkibCity: import("@prisma/client").$Enums.MawkibCity | null;
            owner: {
                id: number;
                mobileNumber: string;
                fullName: string;
            };
        };
        author: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
        repliedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        mawkibId: number;
        updatedAt: Date;
        authorUserId: number;
        content: string;
        repliedAt: Date | null;
        repliedByUserId: number | null;
        ownerReply: string | null;
    }>;
}
