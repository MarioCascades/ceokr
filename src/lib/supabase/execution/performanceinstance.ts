export interface PerformanceInstance {
  id: string;

  assignmentId: string;

  status: "active" | "completed";

  startedAt?: Date;

  submittedAt?: Date;

  approvedAt?: Date;
}
