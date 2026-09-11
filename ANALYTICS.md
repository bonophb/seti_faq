# GA4 tracking

Measurement ID: G-D8WD3NKS7N. Tracking schema version: 2.

## Common parameters
All custom events include ui_language (KO/EN), page_type (faq/randomizer), tracking_version (2).
Events use scalar parameters, strings capped at 100 characters. Analytics exceptions do not interrupt UI actions.
Existing event names are retained. FAQ titles and redundant translated labels are replaced by stable IDs and canonical labels.

## Events and trigger rules

| Event | Trigger | Main parameters |
| --- | --- | --- |
| search | Nonempty input idle for 800ms, Enter, or pending search flushed before opening an FAQ | search_term, search_term_policy, search_type, result_count, edition_filter, category_filter, search_sequence |
| faq_open | Answer opened by the user or resolved shared link | faq_id, faq_slug, faq_category, faq_edition, open_source; result_position and search_sequence for search opens |
| view_en_original | English answer changed from hidden to shown | faq_id, faq_slug, faq_category, faq_edition |
| faq_share | Clipboard write actually succeeds | FAQ fields, share_method=clipboard |
| faq_filter_change | Edition or category selection actually changes | filter_name, edition_filter, category_filter, result_count |
| language_change | User changes language; not initialization or cross-tab synchronization | previous_language, ui_language |
| faq_load | One terminal outcome for the current load operation, including alternate-source attempts | load_status, data_mode, load_source, load_duration_ms, faq_count, attempt_count, error_type |
| randomizer_select_mode | User starts a new mode selection | game_mode, banned_count, candidate_count |
| randomizer_ban_change | A species is actually excluded or re-included | alien_id, ban_action, game_mode, banned_count, candidate_count |
| randomizer_confirm_ban | Exclusion setup confirmed; consecutive identical configurations deduplicated | game_mode, banned_count, candidate_count |
| randomizer_ban_snapshot | One event per eligible species on each recorded confirmation | alien_id, is_banned (0/1), game_mode, banned_count, candidate_count |
| randomizer_draw_start | Spin begins, once per draw | game_mode, slot_position, draw_order, candidate_count, candidate_mask, banned_count, draw_sequence |
| randomizer_alien_discovered | Result is committed, once per draw | draw fields, alien_id, is_expansion (0/1) |
| randomizer_complete | Second result committed, once per completed pair | game_mode, left_alien_id, right_alien_id, banned_count, candidate_count |
| randomizer_reset | Reset pressed | previous_mode, previous_step, completed_slots |

## Data interpretation
- FAQ IDs are seti-0001 etc. Missing/invalid/duplicate stable IDs are reported as faq_id=legacy with the existing safe slug as a diagnostic.
- open_source is browse/search/shared_link. Resolving the same hash again after a data refresh is not another view.
- Search events deduplicate consecutive identical query/filter/language/result snapshots. Input clearing resets deduplication.
- search_sequence and draw_sequence are page-local counters, not user identifiers or globally unique IDs. Do not register them as report dimensions.
- search_term only contains short card numbers or phrases already in the public FAQ text. Input resembling email/URL/long phone-like numbers and unknown phrases becomes [unclassified], with search_term_policy=redacted. Unknown misspellings can be counted but not read verbatim. Raw input is not transmitted by these custom events.
- Treat search-to-open as engagement, not proof that the question was resolved.
- load_status is success/saved/error. data_mode=http means an HTTP response, not guaranteed fresh Google Sheets data; cache means the service worker supplied a cached response; backup means validated localStorage data. Older service workers cannot identify their cached responses until updated.
- load_source is published/gviz/fallback. error_type is a controlled label (none/network/timeout/http/csv_parse/empty_data/parser_unavailable), never a raw exception or URL.
- An earlier in-flight load cannot overwrite a later load or report a duplicate outcome.
- Exclusion rate: within randomizer_ban_snapshot, for each alien_id use SUM(is_banned) / event count. This measures confirmed configurations, not unique people. Do not use raw toggle counts for this percentage.
- candidate_mask is a bitset in ALIEN_SPECIES order (bit 0=mascamites through bit 7=amoeba). candidate_count on draw events is the actual draw pool after bans and the opposite winner have been removed.
- Restoring an already completed saved game does not emit a completion event. A reset or changed exclusion selection permits a new completion.
- GA4 events can be blocked or lost, especially offline. They are product analytics, not an authoritative fairness audit.
- No custom outbound-click or PDF-click event is added: first inspect enhanced measurement in GA4 to avoid duplicate counting.
- Existing GA4 historical data retains its old parameter schema; use tracking_version=2 for comparisons.

## GA4 configuration (not applied by repository deployment)
In Admin > Custom definitions create EVENT-scoped custom dimensions for the parameters you need.
Start with: ui_language, page_type, tracking_version, faq_id, faq_category, faq_edition, open_source,
search_type, search_term_policy, edition_filter, category_filter, load_status, data_mode, load_source,
error_type, game_mode, alien_id, ban_action, slot_position, left_alien_id, right_alien_id.
Optional diagnostics: faq_slug, filter_name, previous_language, previous_mode, previous_step, share_method.
Use existing GA4 search-term reporting for search_term; inspect whether an additional definition is needed for the report.
Create custom metrics for result_count, result_position, faq_count, attempt_count, banned_count, candidate_count,
is_banned, completed_slots (standard numeric units); load_duration_ms (milliseconds).
Do not sum candidate_count or result_position as outcome totals; use event-scoped averages/distributions.
Avoid registering raw query combinations, sequence counters or exact masks as dimensions unless a specific report needs them.
Optionally mark randomizer_complete as a key event. Do not mark every click or search as a key event.

## Validation and limitations
Test the emitted dataLayer event payloads, timing, deduplication, privacy filtering, clipboard outcomes,
load source/fallback and stale-response handling, and restored/second-slot draw completion.
Then use GA4 DebugView to confirm actual reception and parameter reporting with your property.
Code deployment does not create these custom definitions or prove server-side receipt.

References:
- https://developers.google.com/analytics/devguides/collection/ga4/reference/events
- https://support.google.com/analytics/answer/14240153
- https://support.google.com/analytics/answer/6366371

