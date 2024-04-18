import { SupabaseClient } from "./supabase.client.ts";

export interface IProject {
  project_id: string;
  name: string;
  description: string;
}

const getById = async (
  projectId: string,
): Promise<IProject | null> => {
  const { data, error } = await SupabaseClient()
    .from("project")
    .select("project_id, name, description").eq("project_id", projectId).limit(
      1,
    );

  if (error) {
    throw new Error(error.message);
  }

  return data && data.length > 0 ? data[0] : null;
};

export const Project = {
  getById,
};
