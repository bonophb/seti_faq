# GA4 추적 안내

측정 ID: `G-D8WD3NKS7N`. 추적 데이터 구조 버전: `2`.

## 공통 매개변수

모든 맞춤 이벤트에는 `ui_language`(KO/EN), `page_type`(faq/randomizer), `tracking_version`(2)이 포함됩니다.
매개변수는 단일 값으로 전송하며 문자열은 100자로 제한합니다. 분석 코드의 오류가 사용자 동작을 중단하지 않습니다.
기존 이벤트 이름은 유지하며, FAQ 제목과 중복 번역 문구 대신 고유 ID와 일관된 기준 명칭을 사용합니다.

## 이벤트와 기록 조건

| 이벤트 | 기록 조건 | 주요 매개변수 |
| --- | --- | --- |
| search | 검색어 입력 후 800ms 동안 추가 입력이 없거나, Enter를 누르거나, FAQ를 열기 전 대기 중인 검색을 기록할 때. 빈 검색어는 제외 | search_term, search_term_policy, search_type, result_count, edition_filter, category_filter, search_sequence |
| faq_open | 사용자가 답변을 열거나 공유 링크에 해당하는 FAQ를 열 때 | faq_id, faq_slug, faq_category, faq_edition, open_source; 검색 결과에서 열면 result_position, search_sequence도 포함 |
| view_en_original | 숨겨진 영어 원문 답변을 표시할 때 | faq_id, faq_slug, faq_category, faq_edition |
| faq_share | 클립보드 복사가 실제로 성공했을 때 | FAQ 식별 매개변수, share_method=clipboard |
| faq_filter_change | 판본 또는 카테고리 선택이 실제로 변경될 때 | filter_name, edition_filter, category_filter, result_count |
| language_change | 사용자가 언어를 변경할 때. 초기 설정과 탭 간 동기화는 제외 | previous_language, ui_language |
| faq_load | 대체 데이터 소스 재시도를 포함한 현재 로딩 작업의 최종 결과를 한 번 기록 | load_status, data_mode, load_source, load_duration_ms, faq_count, attempt_count, error_type |
| randomizer_select_mode | 사용자가 모드를 선택하여 새 설정을 시작할 때 | game_mode, banned_count, candidate_count |
| randomizer_ban_change | 외계종을 실제로 제외하거나 다시 포함할 때 | alien_id, ban_action, game_mode, banned_count, candidate_count |
| randomizer_confirm_ban | 제외 설정을 확정할 때. 동일 설정을 연속 확정하면 중복 기록하지 않음 | game_mode, banned_count, candidate_count |
| randomizer_ban_snapshot | 기록 대상인 설정 확정마다 해당 모드에 포함되는 외계종별로 한 번씩 기록 | alien_id, is_banned (0/1), game_mode, banned_count, candidate_count |
| randomizer_draw_start | 회전 시작 시 추첨당 한 번 | game_mode, slot_position, draw_order, candidate_count, candidate_mask, banned_count, draw_sequence |
| randomizer_alien_discovered | 결과 확정 시 추첨당 한 번 | 추첨 매개변수, alien_id, is_expansion (0/1) |
| randomizer_complete | 두 번째 결과가 확정되어 한 쌍이 완성될 때, 완성된 쌍당 한 번 | game_mode, left_alien_id, right_alien_id, banned_count, candidate_count |
| randomizer_reset | 초기화 버튼을 누를 때 | previous_mode, previous_step, completed_slots |

## 데이터 해석 방법

- FAQ ID는 `seti-0001` 등의 형식입니다. ID가 없거나 유효하지 않거나 중복되면 `faq_id=legacy`로 기록하고, 기존의 안전한 슬러그를 진단용으로 함께 보냅니다.
- `open_source`는 `browse`(일반 목록), `search`(검색 결과), `shared_link`(공유 링크)입니다. 데이터 갱신 후 같은 해시 링크를 다시 처리하는 것은 추가 열람으로 세지 않습니다.
- 검색어·필터·언어·검색 결과가 연속으로 같으면 검색 이벤트를 중복 기록하지 않습니다. 입력을 비우면 중복 판정이 초기화됩니다.
- `search_sequence`와 `draw_sequence`는 현재 페이지 안에서만 사용하는 순번입니다. 사용자 식별자나 전체 서비스에서 고유한 ID가 아니므로 보고서 측정기준으로 등록하지 않습니다.
- `search_term`에는 짧은 카드 번호나 공개 FAQ 본문에 이미 있는 문구만 포함됩니다. 이메일·URL·긴 전화번호 형태의 입력과 확인되지 않은 문구는 `[unclassified]`로 바꾸고 `search_term_policy=redacted`로 기록합니다. 확인되지 않은 오타 검색은 횟수만 집계할 수 있고 원문은 볼 수 없습니다. 이러한 맞춤 이벤트로 가공 전 입력값을 전송하지 않습니다.
- 검색 후 FAQ를 여는 행동은 내용을 살펴봤다는 의미이며, 질문이 해결되었다는 증거는 아닙니다.
- `load_status`는 `success`(성공), `saved`(저장 데이터 사용), `error`(실패)입니다. `data_mode=http`는 HTTP 응답을 사용했다는 뜻이며 최신 Google Sheets 데이터임을 보장하지 않습니다. `cache`는 서비스 워커의 캐시 응답, `backup`은 검증된 localStorage 저장 데이터를 사용했다는 뜻입니다. 이전 서비스 워커는 업데이트되기 전까지 캐시 응답 여부를 표시하지 못합니다.
- `load_source`는 `published`(게시 데이터), `gviz`(대체 소스), `fallback`(최종 대체 처리)입니다. `error_type`은 정해진 분류인 `none/network/timeout/http/csv_parse/empty_data/parser_unavailable`만 사용하며, 원본 오류 메시지나 URL은 보내지 않습니다.
- 먼저 시작한 로딩의 응답이 늦게 도착해도 나중에 시작한 로딩을 덮어쓰거나 결과를 중복 기록하지 않습니다.
- **외계종 제외율:** `randomizer_ban_snapshot`에서 각 `alien_id`별로 `SUM(is_banned) / 이벤트 수`를 계산합니다. 이는 확정된 설정에서의 비율이며 고유 사용자 비율이 아닙니다. 제외 버튼을 누른 횟수로 이 비율을 계산하지 않습니다.
- `candidate_mask`는 `ALIEN_SPECIES` 배열 순서에 따라 후보 포함 여부를 비트로 표시한 값입니다. 비트 0은 `mascamites`, 비트 7은 `amoeba`입니다. 추첨 이벤트의 `candidate_count`는 제외된 외계종과 반대쪽 당첨종을 뺀 실제 추첨 후보 수입니다.
- 이미 완료된 저장 게임을 복원하면 완료 이벤트를 보내지 않습니다. 초기화하거나 제외 설정을 바꾸면 새로운 완료를 기록할 수 있습니다.
- GA4 이벤트는 차단되거나 유실될 수 있으며 특히 오프라인에서 그렇습니다. 이용 행태 분석용 데이터이므로 추첨 공정성을 확정적으로 검증하는 기록으로 사용하지 않습니다.
- 외부 링크 클릭이나 PDF 클릭용 맞춤 이벤트는 추가하지 않았습니다. 중복 집계를 피하려면 먼저 GA4의 향상된 측정 설정을 확인해야 합니다.
- 기존 GA4 과거 데이터에는 이전 매개변수 구조가 남아 있습니다. 비교 시 `tracking_version=2`로 구분합니다.

## GA4 설정 — 저장소 배포만으로 적용되지 않음

**관리 > 맞춤 정의**에서 필요한 매개변수를 **이벤트 범위의 맞춤 측정기준**으로 등록합니다.

우선 등록할 항목:

- 공통: ui_language, page_type, tracking_version
- FAQ: faq_id, faq_category, faq_edition, open_source
- 검색·필터: search_type, search_term_policy, edition_filter, category_filter
- 로딩: load_status, data_mode, load_source, error_type
- 추첨: game_mode, alien_id, ban_action, slot_position, left_alien_id, right_alien_id

선택적으로 등록할 진단 항목: faq_slug, filter_name, previous_language, previous_mode, previous_step, share_method.

`search_term`은 GA4의 기존 검색어 보고 기능을 우선 사용하고, 필요한 보고서에 별도 정의가 필요한지 확인합니다.

다음 항목은 **맞춤 측정항목**으로 등록합니다.

| 단위 | 매개변수 |
| --- | --- |
| 일반 숫자 | result_count, result_position, faq_count, attempt_count, banned_count, candidate_count, is_banned, completed_slots |
| 밀리초 | load_duration_ms |

`candidate_count`나 `result_position`을 합산해서 성과 총계로 해석하지 말고 이벤트별 평균이나 분포를 봅니다.
특정 보고서에 꼭 필요하지 않다면 검색 조건의 세부 조합, 순번, 정확한 후보 마스크 값을 측정기준으로 등록하지 않습니다.
필요하면 `randomizer_complete`를 주요 이벤트로 지정할 수 있습니다. 모든 클릭이나 검색을 주요 이벤트로 지정하지는 않습니다.

## 검증과 한계

dataLayer로 보내는 이벤트의 매개변수와 기록 시점, 중복 방지, 개인정보 필터, 클립보드 복사 성공·실패, 로딩 소스와 대체 처리, 늦게 도착한 응답 처리, 저장 상태 복원 및 두 번째 추첨 결과의 완료 기록을 검증합니다.

그다음 해당 GA4 속성의 **DebugView**에서 실제 수신과 매개변수 표시를 확인해야 합니다.
코드 배포만으로 맞춤 정의가 생성되거나 GA4 서버의 실제 수신이 확인되는 것은 아닙니다.

## 참고 자료

- [GA4 이벤트 참조 문서](https://developers.google.com/analytics/devguides/collection/ga4/reference/events)
- [GA4 맞춤 측정기준](https://support.google.com/analytics/answer/14240153)
- [개인 식별 정보 전송 방지](https://support.google.com/analytics/answer/6366371)
