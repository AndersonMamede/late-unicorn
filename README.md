# Late Unicorn

[Late Unicorn](https://lateunicorn.com) is a digital space where developers and innovators can remember their projects that didn't work out. It's a place to celebrate the ideas and lessons from these projects, even if they didn’t make it to the finish line. Here, the tech community can look back, learn, and get inspired for their next big thing.

## 1. Supabase setup

This project uses [Supabase](https://supabase.com/) as the backend (Edge Functions), database (PostgreSQL), and authentication (Google OAuth) provider. To set up this project, both the frontend and backend projects need to be configured. Before starting, the following requirement(s) need to be met in Supabase:

- Google OAuth setup (for authentication)

Then, follow the steps below to set up both the frontend and backend projects.

## 2. Frontend (Pug + TailwindCSS)

The frontend project uses Pug + TailwindCSS. All the project's source code is in the `src-frontend` directory:
* `/src-frontend/src/` - the main source directory
* `/src-frontend/src/pug/` - the page templates directory, where you can find the Pug files
* `/src-frontend/src/tailwind/` - files used to build the Tailwind theme
* `/src-frontend/dist/` - the output directory which contains the production-ready files

### Frontend project requirements

* [Node.js](https://nodejs.org/en/download/current)
- [NPM](https://www.npmjs.com/get-npm)

### Frontend project setup

First, set the project's configuration values in the `/src-frontend/src/assets/config.json` file; all values are required, and you can find the values in your [Supabase project](https://supabase.com/) settings. Then, run the following commands:

```bash
# Enter the frontend project directory
cd src-frontend

# Install dependencies
npm install 

# Run dev server with live preview (Browsersync)
npm run watch

# Or make a production build 
npm run build
```

The project will be available at `http://localhost:3000`.

## 3. Backend (Supabase Edge Functions and DB/PostgreSQL)

The backend project consists of a Supabase Edge Function that generates the project's speculations (fictitious sentences) using the OpenAI API. All the project's source code is in the `src-supabase` directory.

### Backend project requirements

- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Deno](https://deno.land/#installation)
- [NPM](https://www.npmjs.com/get-npm)

### Backend project setup

The first step is to [execute the database migrations](https://supabase.com/docs/reference/cli/supabase-db#supabase-db-push) to create the database structure for your project. Once you have logged in to your Supabase account and established the [linked to your project](https://supabase.com/docs/reference/cli/supabase-link), run the following commands to execute the migrations:

```bash
# Enter the backend project directory
cd src-supabase

# Execute the migrations, confirmation is required
npx supabase db push
```

Next, set up the project's API URL so that the database trigger can read it. To do this, create a secret in the Supabase project's Vault named `PROJECT_SPECULATIONS_API_URL` and set its value to the Edge Function's URL. To obtain the function's URL, access the Supabase console and look for **Edges**. Copy the provided URL.

After obtaining the function's URL, execute the following query in Supabase's SQL editor to configure the Edge Function's URL:

```sql
SELECT public.set_edge_function_url_secret(
    'PROJECT_SPECULATIONS_API_URL', -- do not change this line
    'YOUR-EDGE-FUNCTION-URL-HERE' -- replace 'YOUR-EDGE-FUNCTION-URL-HERE' with the URL obtained earlier
) as result;
```

Now, set your OpenAI API key in the Edge Functions of your Supabase project to authenticate API calls to OpenAI. Create a secret named `OPENAI_API_KEY` in the Edge Functions of your Supabase project.

Finally, deploy the Edge Function by running the following command:

```bash
# Enter the backend project directory
cd src-supabase

# Deploy the Edge Function
npm run deploy:generate-project-speculations
```

Both the frontend and backend projects are now set up and ready to use.

### `generate-project-speculations` Edge Function

For more information about the `generate-project-speculations` Edge Function, see the [README](src-supabase/README.md) file.
