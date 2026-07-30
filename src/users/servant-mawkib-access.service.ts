import { Injectable } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServantMawkibAccessService {
  constructor(private prisma: PrismaService) {}

  async getAccessibleMawkibIds(servantUserId: number): Promise<number[]> {
    const user = await this.prisma.user.findFirst({
      where: {
        id: servantUserId,
        isActive: true,
        roles: { some: { role: { name: RoleName.MawkibServant } } },
      },
      select: {
        servantAllMawkibsAccess: true,
        servantOwnerUserId: true,
        servantMawkibId: true,
        mawkibServantAccesses: { select: { mawkibId: true } },
        servantMawkib: { select: { ownerUserId: true } },
      },
    });

    if (!user) {
      return [];
    }

    const ownerUserId =
      user.servantOwnerUserId ?? user.servantMawkib?.ownerUserId ?? null;

    if (user.servantAllMawkibsAccess && ownerUserId != null) {
      const mawkibs = await this.prisma.mawkib.findMany({
        where: { ownerUserId },
        select: { id: true },
      });
      return mawkibs.map((m) => m.id);
    }

    const ids = new Set(user.mawkibServantAccesses.map((row) => row.mawkibId));
    if (user.servantMawkibId != null) {
      ids.add(user.servantMawkibId);
    }
    return [...ids];
  }

  async hasAccess(servantUserId: number, mawkibId: number): Promise<boolean> {
    const ids = await this.getAccessibleMawkibIds(servantUserId);
    return ids.includes(mawkibId);
  }
}
