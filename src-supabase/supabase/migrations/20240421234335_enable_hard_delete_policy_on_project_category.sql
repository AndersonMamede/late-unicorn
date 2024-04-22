CREATE POLICY "Allo users to DELETE their own data" ON public.project_category
    FOR DELETE USING (auth.uid() = user_id);
