ALTER TABLE public.category ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_screenshot ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_category ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_speculation ENABLE ROW LEVEL SECURITY;

-- allow users to SELECT any data
CREATE POLICY "Allow anyone to read" ON public.category
    FOR SELECT USING (true);

-- allow users to SELECT any data as long as it's not soft-deleted
CREATE POLICY "Allow anyone to read" ON public.project
    FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "Allow anyone to read" ON public.project_screenshot
    FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "Allow anyone to read" ON public.project_category
    FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "Allow anyone to read" ON public.project_speculation
    FOR SELECT USING (deleted_at IS NULL);

-- allow users to INSERT their own data
CREATE POLICY "Allow users to INSERT their own data" ON public.project
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to INSERT their own data" ON public.project_screenshot
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to INSERT their own data" ON public.project_category
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to INSERT their own data" ON public.project_speculation
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- allow users to UPDATE their own data as long as it's not soft-deleted
CREATE POLICY "Allow users to UPDATE their own data" ON public.project
    FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL)
    WITH CHECK (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Allow users to UPDATE their own data" ON public.project_screenshot
    FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL)
    WITH CHECK (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Allow users to UPDATE their own data" ON public.project_category
    FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL)
    WITH CHECK (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Allow users to UPDATE their own data" ON public.project_speculation
    FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL)
    WITH CHECK (auth.uid() = user_id AND deleted_at IS NULL);
