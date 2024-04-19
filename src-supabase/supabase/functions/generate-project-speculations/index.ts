import { generateSentences } from "./integration/generate-sentences.ts";
import { Project } from "./database/project.ts";
import { ProjectSpeculation } from "./database/project-speculation.ts";
import { payloadValidation } from "./payloadValidation.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST",
};

const handleRequest = async (req: Request) => {
  try {
    if (req.method !== "POST") {
      return new Response(null, {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 405,
      });
    }

    const { projectId } = await req.json();
    const { passes, errors } = await payloadValidation({
      method: req.method,
      projectId,
    });

    if (!passes) {
      return new Response(
        JSON.stringify({ errors }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    const project = await Project.getById(projectId);

    if (!project) {
      return new Response(null, {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 406,
      });
    }

    const { sentences } = await generateSentences({ project });
    await ProjectSpeculation.create({ project, sentences });

    return new Response(
      JSON.stringify({ sentences }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
};

Deno.serve(handleRequest);
