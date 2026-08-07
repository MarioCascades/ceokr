import type { BuilderDocument } from "@/lib/types/builderdocument";
import type { PerformanceInstance } from "@/lib/domain/performanceinstance";

import { createPerformanceInstance } from "@/lib/repositories/performanceinstancerepository";
import { initializePerformanceInstance } from "./initializeperformanceinstance";

export async function createPerformanceExecution(
  performanceInstance: Omit<
    PerformanceInstance,
    "id" | "createdAt"
  >,
  document: BuilderDocument
): Promise<PerformanceInstance> {
  const createdInstance =
    await createPerformanceInstance(
      performanceInstance
    );

  await initializePerformanceInstance(
    createdInstance,
    document
  );

  return createdInstance;
}