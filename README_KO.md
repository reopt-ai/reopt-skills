# reopt Skills

`reopt` 엔지니어링 워크플로우를 위한 재사용 가능한 스킬 저장소 — [`skills`](https://skills.sh) CLI를 지원하는 모든 에이전트 런타임(Claude Code, Cursor, Codex, Cline, Gemini CLI 등 15+개)에 설치할 수 있습니다.

> English: see [README.md](./README.md).
>
> 이 스킬들이 대상으로 삼는 모든 패키지는 공개 npm 레지스트리에서 설치할 수 있습니다. GitHub Packages 토큰이나 스코프 전용 `.npmrc` 설정은 필요하지 않습니다.
>
> **v1.x 에서 업그레이드 중이신가요?** 슬림 스킬 재작성에 대한 안내는 [MIGRATION-v2.md](./MIGRATION-v2.md) 참고.

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

## 스킬은 어떻게 동작하나 (v2)

각 스킬은 두 가지 일을 합니다.

1. **AGENTS.md 에 marker 블록을 박는다** — 컨슈머 프로젝트의 `AGENTS.md` (없으면 `CLAUDE.md`) 에 `<!-- BEGIN:reopt/<pkg>-agent-rules -->` … `<!-- END:reopt/<pkg>-agent-rules -->` 마커 사이에 모듈 가이드 블록을 추가합니다. 재설치나 버전 업그레이드 시 마커 사이만 교체되고 바깥 텍스트는 보존됩니다 (Next.js 16.2+ 가 쓰는 패턴과 동일).
2. **모듈 docs 로 라우팅한다** — 각 `@reopt-ai/*` 패키지가 자기 docs 를 출판합니다 — `dist/docs/` (opt-ui / opt-datagrid / opt-editor), 최상위 `docs/` (brandapp-sdk), 또는 `README.md` / `shell-llms.txt` (cli, opt-chat, opt-shell). SKILL.md 는 API 표면을 복제하지 않고, "어떤 상황에 어느 docs 파일을 보라"는 라우팅만 제공합니다. 모듈 docs 는 설치된 버전에 핀 고정되지만, 스킬은 그렇지 않습니다.

스킬에 남는 것은 모듈 안에 둘 수 없는 컨슈머 프로젝트 설정뿐입니다 — 레거시 레지스트리 설정 정리, env 네임스페이스 규칙, peer deps, requires 체인, 파괴적 변경 가드레일, 보안 규칙.

타깃 패키지가 자기 `dist/agent-rules.md` 를 출판하기 전까지, 각 스킬은 SKILL.md 옆에 폴백 `agent-rules.md` 사본을 함께 출하합니다.

## 스킬 목록

### CLI 워크플로우

`reopt` CLI 자체에 대한 가이드. CLI는 공개 npm 패키지입니다.

| 스킬 | 다루는 내용 |
| --- | --- |
| [`reopt-cli`](./skills/reopt-cli/) | 다른 reopt 스킬이 가장 먼저 로드하는 베이스라인 — auth(`login`/`status`/`logout`), 글로벌 플래그, MCP, `config get/set`, 종료 코드, 자격증명 처리 규칙. 공유되는 `reopt/cli-agent-rules` 블록을 박습니다. |
| [`reopt-brandapp`](./skills/reopt-brandapp/) | `brandapp list` / `link` / `unlink` / `doctor` / `term list`, `init`을 통한 프로젝트 스캐폴딩, 오프라인 `dev` + `seed` 흐름, 샌드박스 `env list/create/use/destroy`. |
| [`reopt-eav`](./skills/reopt-eav/) | EAV 스키마 라이프사이클 — 라이브 흐름용 `status` / `sync` / `pull` / `plan`, 파일 기반 마이그레이션용 `migrate create/run/status/validate` (experimental), `--delete-orphans` 파괴적 변경 가드레일. |

### Brandapp SDK 통합

`@reopt-ai/brandapp-sdk` 를 사용하는 컨슈머 프로젝트용. **컨슈머 앱 내부**에서 동작하며 CLI 와 무관합니다.

| 스킬 | 다루는 내용 |
| --- | --- |
| [`brandapp-sdk-install`](./skills/brandapp-sdk-install/) | `reopt/brandapp-sdk-agent-rules` 블록을 박고, 레거시 GitHub Packages override를 제거한 뒤 env 3-tier 네임스페이스(`BRANDAPP_*` / `REOPT_*` / `BRANDAPP_SDK_*`) + peer deps 를 세팅. `lib/sdk.ts`, `lib/auth.ts`, EAV 스키마, webhook, 마케팅 사이트 helper, 에러 처리는 모듈 docs 로 라우팅. |
| [`brandapp-sdk-review`](./skills/brandapp-sdk-review/) | 기존 SDK 코드를 감사. 안티패턴을 10개 카테고리(init / Auth / Error / Config / Schema / Perf / React / Webhook / Debug / CMS)로 묶고 grep key 와 함께 나열, 정답 수정은 모듈 `docs/` 로 라우팅. |

### 패키지 설치 / 업그레이드

`@reopt-ai/opt-*` 컴포넌트 패키지를 사용하는 컨슈머 프로젝트용.

| 스킬 | 다루는 내용 |
| --- | --- |
| [`opt-ui-install`](./skills/opt-ui-install/) | Tailwind v4 + `OptThemeProvider` + `opt-cli doctor` 감사 + Surface CLI (`opt-cli surface add`). |
| [`opt-editor-install`](./skills/opt-editor-install/) | Editor 컴포넌트 + 레시피 + `opt-cli doctor` 감사 + 선택적 AI 스트리밍 (`--with-ai`). |
| [`opt-chat-install`](./skills/opt-chat-install/) | AI SDK 엔드포인트 + Conversation 스캐폴드. Vercel AI SDK 호환. |
| [`opt-datagrid-install`](./skills/opt-datagrid-install/) | 설치 / 업그레이드 / glide-data-grid·ag-grid·react-data-grid·MUI DataGrid 에서의 마이그레이션. |
| [`opt-shell-install`](./skills/opt-shell-install/) | 제품 프레임 레이어 (구 opt-harness): workspace 레시피(Dashboard / List / Detail / Editor / Landing), density/contentWidth/navigation/motion 정책, 데이터 엔진 adapter, state boundary. 필수 peer: opt-palette; 선택 adapter peer: opt-datagrid·opt-editor·opt-calendar. |

## 어떤 스킬을 골라야 하나

두 축으로 결정합니다.

- **무엇을 다루는가** — `reopt` CLI 자체인지, 컨슈머 앱 안의 `@reopt-ai/*` 패키지 코드인지.
- **어느 단계인가** — 처음 설치하는 것인지, 이미 쓰고 있는 코드를 감사하는 것인지.

| 하고 싶은 것 | 사용할 스킬 |
| --- | --- |
| CLI 인증, 글로벌 플래그 설정, 자격증명 관리 | `reopt-cli` |
| 디렉터리를 brandapp 에 link, 오프라인 dev 서버, 샌드박스 env 관리 | `reopt-brandapp` |
| EAV 스키마 diff / sync / pull / 마이그레이션 | `reopt-eav` |
| Next.js 앱에 `@reopt-ai/brandapp-sdk` 를 처음 도입 | `brandapp-sdk-install` |
| 이미 SDK 를 쓰는 앱의 안티패턴 감사 | `brandapp-sdk-review` |
| `opt-*` 컴포넌트 패키지 (opt-shell 제품 프레임 포함) 도입 또는 업그레이드 | 해당 `opt-*-install` 스킬 |

## 일반적인 도입 순서

신규 Brandapp + Next.js 컨슈머 기준:

1. `reopt-cli` — `reopt login` 으로 로그인.
2. `reopt-brandapp` — 프로젝트 `link`; 필요 시 dev 서버 부트스트랩을 위해 `init`.
3. `reopt-eav` — `eav.schema.ts` 작성 후 `eav sync` 로 게시.
4. `brandapp-sdk-install` — agent-rules 블록을 박고 레거시 레지스트리 override를 정리한 뒤, 모듈 docs 를 따라 SDK + Better Auth 라우트 핸들러 연결.
5. (시간이 흐른 뒤) `brandapp-sdk-review` — SDK 가 발전함에 따라 주기적으로 감사.

`reopt-brandapp init` 과 `brandapp-sdk-install` 은 **중복이 아니라 보완 관계**입니다. `init` 은 **개발 모드 파일**(`.env.development`, `reopt.seed.ts`, `lib/dev-server.ts`, `instrumentation.ts`, `package.json` 의 `dev:local` 스크립트, `.gitignore` 의 `.reopt/`)을 작성하고, `brandapp-sdk-install` 은 레거시 프로젝트 레지스트리 override를 정리한 뒤 **SDK 앱 코드**를 모듈 docs 에 따라 작성합니다(`.env.local`, `lib/sdk.ts`, `lib/auth*.ts`, auth 라우트 핸들러, 선택적 webhook). 로컬 개발까지 가능한 신규 프로젝트를 만들려면 둘 다 실행하세요.

## 구조

각 스킬은 `skills/<skill-name>/` 아래 자체 디렉터리에 있습니다.

- `SKILL.md` — 에이전트용 지침 (필수, YAML frontmatter 포함, 150줄 이하).
- `agent-rules.md` — 전환기 폴백 마커 블록 소스.
- `README.md` — 기여자용 요약 (선택).
- `metadata.json` — 가벼운 카탈로그 메타데이터 (선택).

`command/`, `references/`, `scripts/` 같은 하위 디렉터리는 v2 에서 폐지되었습니다. 장문 콘텐츠는 타깃 패키지의 docs (`dist/docs/`, 최상위 `docs/`, 또는 패키지에 따라 `README.md` / `shell-llms.txt`) 에 둡니다.

## 개발

```bash
pnpm validate    # 스킬 구조 / frontmatter / 줄수 예산 / 마커 컨벤션 검증
```

`pnpm sync:cli` 는 reopt 내부 메인테이너 전용입니다 — [AGENTS.md](./AGENTS.md) 참고.

## 라이선스

[MIT](./LICENSE)
