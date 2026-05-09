# reopt Skills

`reopt` 엔지니어링 워크플로우를 위한 재사용 가능한 스킬 저장소 — [`skills`](https://skills.sh) CLI를 지원하는 모든 에이전트 런타임(Claude Code, Cursor, Codex, Cline, Gemini CLI 등 15+개)에 설치할 수 있습니다.

> English: see [README.md](./README.md).

> 스킬 관련 모듈과 CLI는 **2026년 5월** 공개 출시 예정입니다.

## 빠른 시작

모든 스킬을 에이전트 런타임에 한 번에 설치:

```bash
npx skills add reopt-ai/reopt-skills
```

또는 단일 스킬만 설치:

```bash
npx skills add reopt-ai/reopt-skills/reopt-eav
```

스킬 디렉터리 페이지: [`skills.sh/reopt-ai/reopt-skills`](https://skills.sh/reopt-ai/reopt-skills).

## 스킬 목록

### CLI 워크플로우

`reopt` CLI 자체에 대한 가이드. 비공개 패키지 접근이 필요 없습니다.

| 스킬 | 다루는 내용 |
| --- | --- |
| [`reopt-cli`](./skills/reopt-cli/) | 다른 reopt 스킬이 가장 먼저 로드하는 베이스라인 — `login` / `status`, 글로벌 플래그(`--format`, `--fields`, 페이징, 재시도), MCP, `config get/set`, 종료 코드, 자격증명 처리 규칙. |
| [`reopt-brandapp`](./skills/reopt-brandapp/) | EAV를 제외한 brandapp 라이프사이클 — `list` / `link` / `unlink` / `doctor` / `term list`, `init`을 통한 프로젝트 스캐폴딩(개발 모드 부트스트랩), 오프라인 `dev` + `seed` 흐름, 샌드박스 `env list/create/use/destroy`. |
| [`reopt-eav`](./skills/reopt-eav/) | EAV 스키마 라이프사이클 — 라이브 흐름용 `status` / `sync` / `pull` / `plan`, 파일 기반 마이그레이션용 `migrate create/run/status/validate`, `--delete-orphans` 파괴적 변경 가드레일. |

### Brandapp SDK 통합

`@reopt-ai/brandapp-sdk`를 사용하는 컨슈머 프로젝트용. **컨슈머 앱 내부**에서 동작하며, CLI와 무관합니다.

| 스킬 | 다루는 내용 |
| --- | --- |
| [`brandapp-sdk-install`](./skills/brandapp-sdk-install/) | 신규 SDK 셋업 — `.npmrc` (GitHub Packages 인증), `.env.local` 템플릿 + zod 환경변수 검증, `lib/sdk.ts` (`createLazySDK`), `lib/auth.ts` + `lib/auth-client.ts` (Better Auth + OAuth), `app/api/auth/[...all]/route.ts`, 선택적 `lib/eav.schema.ts`, 선택적 webhook 핸들러, 선택적 1.8+ 마케팅 사이트 helper(`toMetadata`, `toSitemapItems`, `toRssFeed`, `verifySession`, `optimizeUrl`), 검증 체크리스트. |
| [`brandapp-sdk-review`](./skills/brandapp-sdk-review/) | 기존 SDK 코드를 감사하고 구체적 개선안을 제시 — EAV(싱글톤, load-all + filter, 수동 upsert, 수동 페이지네이션, per-item bulk 루프, enum/coerce helper, count), Auth(라우트 보호, 사인아웃 에러처리, 세션 캐싱), Error / Config / Schema / Perf / React / Webhook / Debug, 1.8+ CMS / 외부 사이트 패턴. 카테고리별 리포트를 출력하고 항목별 자동 적용을 제안. |

### 패키지 설치 / 업그레이드

`@reopt-ai/opt-*` 컴포넌트 패키지를 사용하는 컨슈머 프로젝트용.

| 스킬 | 다루는 내용 |
| --- | --- |
| [`opt-ui-install`](./skills/opt-ui-install/) | Tailwind v4 + `OptThemeProvider` + 테마 부트 스크립트, 26단계 doctor, Surface CLI 워크플로우. |
| [`opt-editor-install`](./skills/opt-editor-install/) | Block catalog + Editor 컴포넌트, 18단계 doctor, 선택적 AI 스트리밍(`--with-ai`). |
| [`opt-chat-install`](./skills/opt-chat-install/) | AI SDK 엔드포인트 + Conversation 스타터 스캐폴드. |
| [`opt-datagrid-install`](./skills/opt-datagrid-install/) | 설치 / 업그레이드 / 마이그레이션(glide-data-grid, ag-grid, react-data-grid, MUI DataGrid → opt-datagrid). |
| [`opt-harness-install`](./skills/opt-harness-install/) | Harness manifest + `HarnessProvider` + AppShell + 레시피 기반 첫 Workspace 페이지. |

### 공유 템플릿

여러 스킬이 참조하는 스캐폴딩 — 단독 설치 불가.

| 경로 | 용도 |
| --- | --- |
| [`_shared/upgrade-pipeline.md`](./skills/_shared/upgrade-pipeline.md) | 공통 7단계 업그레이드 파이프라인(현재 `opt-editor-install`이 사용). |
| [`_shared/breaking-changes-template.md`](./skills/_shared/breaking-changes-template.md) | 각 install 스킬의 `references/breaking-changes.md`가 따라야 할 형식. |

## 어떤 스킬을 골라야 하나

두 축으로 결정합니다.

- **무엇을 다루는가** — `reopt` CLI 자체인지, 컨슈머 앱 안의 `@reopt-ai/*` 패키지 코드인지.
- **어느 단계인가** — 처음 설치하는 것인지, 이미 쓰고 있는 코드를 감사하는 것인지.

| 하고 싶은 것 | 사용할 스킬 |
| --- | --- |
| CLI 인증, 글로벌 플래그 설정, 자격증명 관리 | `reopt-cli` |
| 디렉터리를 brandapp에 link, 오프라인 dev 서버, 샌드박스 env 관리 | `reopt-brandapp` |
| EAV 스키마 diff / sync / pull / 마이그레이션 | `reopt-eav` |
| Next.js 앱에 `@reopt-ai/brandapp-sdk`를 처음 도입 | `brandapp-sdk-install` |
| 이미 SDK를 쓰는 앱의 안티패턴 감사 | `brandapp-sdk-review` |
| `opt-*` 컴포넌트 패키지 도입 또는 업그레이드 | 해당 `opt-*-install` 스킬 |

## 일반적인 도입 순서

신규 Brandapp + Next.js 컨슈머 기준:

1. `reopt-cli` — `reopt login`으로 로그인.
2. `reopt-brandapp` — 프로젝트 `link`; 필요시 dev 서버 부트스트랩을 위해 `init`.
3. `reopt-eav` — `eav.schema.ts` 작성 후 `eav sync`로 게시.
4. `brandapp-sdk-install` — SDK 설치 및 `lib/sdk.ts` / Better Auth / 라우트 핸들러 / (선택) webhook 연결.
5. (시간이 흐른 뒤) `brandapp-sdk-review` — SDK가 발전함에 따라 주기적으로 감사.

`reopt-brandapp init`과 `brandapp-sdk-install`은 **중복이 아니라 보완 관계**입니다. `init`은 **개발 모드 파일**(`.env.development`, `reopt.seed.ts`, `lib/dev-server.ts`, `instrumentation.ts`, `package.json`의 `dev:local` 스크립트, `.gitignore`의 `.reopt/`)을 작성하고, `brandapp-sdk-install`은 **SDK 앱 코드**(`.npmrc`, `.env.local`, `lib/sdk.ts`, `lib/auth*.ts`, auth 라우트 핸들러, 선택적 webhook)를 작성합니다. 로컬 개발까지 가능한 신규 프로젝트를 만들려면 둘 다 실행하세요.

## 구조

각 스킬은 `skills/<skill-name>/` 아래 자체 디렉터리에 있습니다.

- `SKILL.md` — 에이전트용 지침 (필수, YAML frontmatter 포함)
- `README.md` — 기여자용 요약 (선택)
- `metadata.json` — 가벼운 카탈로그 메타데이터 (선택)
- `command/`, `references/`, `scripts/` — 선택적 스킬 자산

`_`로 시작하는 디렉터리(예: `skills/_shared/`)는 다른 스킬이 참조하는
공유 스캐폴딩 템플릿입니다. 단독 스킬로 설치할 수 없으며 validator도
건너뜁니다.

## 개발

```bash
pnpm validate    # 스킬 구조와 frontmatter 검증
```

`pnpm sync:cli`는 reopt 내부 메인테이너 전용입니다 — [AGENTS.md](./AGENTS.md) 참고.

## 라이선스

[MIT](./LICENSE)
