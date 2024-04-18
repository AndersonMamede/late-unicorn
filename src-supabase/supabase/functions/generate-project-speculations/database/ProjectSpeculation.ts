import { IProject } from "./Project.ts";
import { SupabaseClient } from "./supabaseClient.ts";

const create = async (
  input: {
    project: IProject;
    sentences: string[];
  },
) => {
  const sentences = input.sentences ?? [];
  const values = sentences.map((sentence) => ({
    project_id: input.project.project_id,
    sentence,
  }));

  const { error } = await SupabaseClient()
    .from("project_speculation")
    .insert(values);

  if (error) {
    throw new Error(error.message);
  }
};

export const ProjectSpeculation = {
  create,
};
