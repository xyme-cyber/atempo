GRANT SELECT, INSERT, UPDATE, DELETE ON public.day_logs TO authenticated;
GRANT ALL ON public.day_logs TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.goals TO authenticated;
GRANT ALL ON public.goals TO service_role;