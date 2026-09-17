create or replace function public.notify_qeh_professional_application_telegram()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  webhook_secret text;
begin
  select decrypted_secret
  into webhook_secret
  from vault.decrypted_secrets
  where name = 'qeh_notification_webhook_secret'
  limit 1;

  if webhook_secret is null then
    raise warning 'Secret Telegram introuvable : candidature enregistrée sans notification.';
    return new;
  end if;

  begin
    perform net.http_post(
      url := 'https://ifszvvkijrrqtssardja.supabase.co/functions/v1/qeh-professional-approval',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-qeh-notification-secret', webhook_secret
      ),
      body := jsonb_build_object(
        'type', tg_op,
        'table', tg_table_name,
        'schema', tg_table_schema,
        'record', jsonb_build_object(
          'id', new.id,
          'status', new.status
        ),
        'old_record', null
      ),
      timeout_milliseconds := 5000
    );
  exception
    when others then
      raise warning 'Notification Telegram de candidature non programmée : %', sqlerrm;
  end;

  return new;
end;
$$;

drop trigger if exists notify_qeh_professional_application_telegram
on public.qeh_professional_applications;

create trigger notify_qeh_professional_application_telegram
after insert on public.qeh_professional_applications
for each row
execute function public.notify_qeh_professional_application_telegram();

revoke all on function public.notify_qeh_professional_application_telegram()
from public, anon, authenticated;
