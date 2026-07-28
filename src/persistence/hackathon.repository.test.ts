import { describe, it, expect, vi, beforeEach } from "vitest";
import { HackathonRepository } from "./hackathon.repository";

describe("HackathonRepository - Auto Cleanup & Filtering", () => {
  let mockPrisma: any;
  let repository: HackathonRepository;

  beforeEach(() => {
    mockPrisma = {
      hackathon: {
        deleteMany: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
      },
    };
    repository = new HackathonRepository(mockPrisma as any);
  });

  it("deleteEndedHackathons removes events where endsAt < now or startsAt < graceDate when endsAt is null", async () => {
    mockPrisma.hackathon.deleteMany.mockResolvedValue({ count: 5 });
    const testNow = new Date("2026-07-28T12:00:00.000Z");
    const graceDate = new Date(testNow.getTime() - 30 * 24 * 60 * 60 * 1000);

    const deleted = await repository.deleteEndedHackathons(testNow);

    expect(deleted).toBe(5);
    expect(mockPrisma.hackathon.deleteMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { endsAt: { lt: testNow } },
          { endsAt: null, startsAt: { lt: graceDate } },
        ],
      },
    });
  });

  it("findFiltered orders records by startsAt desc (latest first) and excludes ended hackathons", async () => {
    const mockData = [
      { id: "1", title: "Future Hack 2", startsAt: new Date("2026-09-01") },
      { id: "2", title: "Future Hack 1", startsAt: new Date("2026-08-01") },
    ];
    mockPrisma.hackathon.findMany.mockResolvedValue(mockData);
    mockPrisma.hackathon.count.mockResolvedValue(2);

    const result = await repository.findFiltered({ page: 1, limit: 10 });

    expect(result.data).toEqual(mockData);
    expect(result.total).toBe(2);

    expect(mockPrisma.hackathon.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { startsAt: "desc" },
        take: 10,
        skip: 0,
      })
    );
  });

  it("removes stale records from a fully scraped source", async () => {
    mockPrisma.hackathon.deleteMany.mockResolvedValue({ count: 3 });

    const deleted = await repository.deleteMissingFromSource("devpost", ["1", "2"]);

    expect(deleted).toBe(3);
    expect(mockPrisma.hackathon.deleteMany).toHaveBeenCalledWith({
      where: {
        sourcePlatform: "devpost",
        sourceId: { notIn: ["1", "2"] },
      },
    });
  });
});
