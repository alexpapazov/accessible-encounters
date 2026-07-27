import { getSupabase } from "./supabase";
import type {
  CaseMode,
  DelayedOutcome,
  MetricState,
  PathStep,
} from "./types";

/** Serialized mid-run state — enough to resume exactly where the user left off. */
export interface SavedRunState {
  nodeId: string;
  metrics: MetricState;
  clock: number;
  path: PathStep[];
  queue: DelayedOutcome[];
}

export interface AttemptRow {
  id: string;
  case_id: string;
  case_version: number;
  mode: CaseMode;
  status: "in-progress" | "completed" | "abandoned";
  path: PathStep[];
  state: SavedRunState | null;
  final_metrics: MetricState | null;
  outcome_summary: string | null;
  parent_attempt_id: string | null;
  branch_node_id: string | null;
  started_at: string;
  completed_at: string | null;
}

export async function createAttempt(
  userId: string,
  caseId: string,
  caseVersion: number,
  mode: CaseMode,
  branch?: { parentAttemptId: string; branchNodeId: string }
): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("attempts")
    .insert({
      user_id: userId,
      case_id: caseId,
      case_version: caseVersion,
      mode,
      parent_attempt_id: branch?.parentAttemptId ?? null,
      branch_node_id: branch?.branchNodeId ?? null,
    })
    .select("id")
    .single();
  if (error) {
    console.error("createAttempt failed:", error.message);
    return null;
  }
  return data.id;
}

/** Every completed attempt at one case — powers the Explored Paths map. */
export async function listCaseAttempts(
  userId: string,
  caseId: string
): Promise<AttemptRow[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data } = await supabase
    .from("attempts")
    .select("*")
    .eq("user_id", userId)
    .eq("case_id", caseId)
    .eq("status", "completed")
    .order("started_at", { ascending: true });
  return (data as AttemptRow[]) ?? [];
}

export async function saveProgress(attemptId: string, state: SavedRunState) {
  const supabase = getSupabase();
  if (!supabase) return;
  const { error } = await supabase
    .from("attempts")
    .update({ state, path: state.path })
    .eq("id", attemptId);
  if (error) console.error("saveProgress failed:", error.message);
}

export async function completeAttempt(
  attemptId: string,
  finalMetrics: MetricState,
  path: PathStep[],
  outcomeSummary?: string
) {
  const supabase = getSupabase();
  if (!supabase) return;
  const { error } = await supabase
    .from("attempts")
    .update({
      status: "completed",
      final_metrics: finalMetrics,
      path,
      state: null,
      outcome_summary: outcomeSummary ?? null,
      completed_at: new Date().toISOString(),
    })
    .eq("id", attemptId);
  if (error) console.error("completeAttempt failed:", error.message);
}

export async function abandonAttempt(attemptId: string) {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.from("attempts").update({ status: "abandoned" }).eq("id", attemptId);
}

export async function latestInProgress(
  userId: string,
  caseId: string
): Promise<AttemptRow | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase
    .from("attempts")
    .select("*")
    .eq("user_id", userId)
    .eq("case_id", caseId)
    .eq("status", "in-progress")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as AttemptRow) ?? null;
}

export async function getAttempt(attemptId: string): Promise<AttemptRow | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase
    .from("attempts")
    .select("*")
    .eq("id", attemptId)
    .maybeSingle();
  return (data as AttemptRow) ?? null;
}

export async function listAttempts(userId: string): Promise<AttemptRow[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data } = await supabase
    .from("attempts")
    .select("*")
    .eq("user_id", userId)
    .neq("status", "abandoned")
    .order("started_at", { ascending: false })
    .limit(100);
  return (data as AttemptRow[]) ?? [];
}
