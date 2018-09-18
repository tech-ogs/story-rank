create view users_submitted as select users.id, login, x.attributes->'locked' as locked, jsonb_agg(story_id) as ranks from application.users, application.user_elections as x, application.ranks as y where x.user_id = users.id and y.user_id = users.id and y.election_id = 2 and x.election_id = 2  and x.attributes->>'locked' = 'true' group by users.id, login, locked;

create or replace  view users_active as with y as (  WITH x AS ( SELECT users.id, users.login, sessions.last_touched  FROM application.sessions,  application.users  WHERE sessions.user_id = users.id AND sessions.last_touched > '2018-09-15'::date AND sessions.logged_in = true  ORDER BY sessions.last_touched  ) SELECT  distinct on (x.login)  x.login, x.id,  x.last_touched  FROM x  ORDER BY login ) select * from y order by last_touched;
