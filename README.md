# LinkedIn Resume Generator

> LinkedIn 프로필을 전문적인 이력서로 변환해주는 웹 애플리케이션

![License](https://img.shields.io/badge/license-MIT-green.svg)
![TypeScript](https://img.shields.io/badge/language-TypeScript-3178C6.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)
![한국어](https://img.shields.io/badge/language-%ED%95%9C%EA%B5%AD%EC%96%B4-blue.svg)

LinkedIn 프로필(PDF 내보내기 파일, 프로필 URL, 또는 내 LinkedIn 계정)을 이력서 데이터로 자동 파싱하고, 섹션을 편집한 뒤 다양한 형식(PDF, Word, PowerPoint, HTML, Markdown, JSON)으로 내보낼 수 있는 이력서 생성 도구입니다.

![메인 화면 스크린샷](./public/mainscreenshot.png?raw=1)

## 주요 기능

- **내 프로필 가져오기**
  - LinkedIn 로그인 버튼으로 실제 로그인 브라우저를 열어 세션 인증 (`Puppeteer`)
  - 로그인 세션을 로컬(`.linkedin/`)에 저장해 재사용하며, 헤더에서 로그아웃 가능
  - 내 프로필 페이지에서 자동으로 PDF 내보내기를 트리거하고 파싱 (실패 시 HTML 파싱으로 대체)

- **프로필 파싱**
  - LinkedIn 프로필 PDF 내보내기 파일 업로드 (`pdf-text-extract`)
  - LinkedIn 프로필 URL 입력 및 스크래핑 (`cheerio`)
  - 경력, 학력, 보유 기술, 자격증(Certifications) 등의 자동 추출
  - 한국어/영문 2단 레이아웃 PDF에서 간단프로필(About) 요약 및 자격증 파싱 지원 (우측 컬럼 노이즈 처리)

- **이력서 편집**
  - 경력 / 학력 / 기술 / 자격증 / 프로젝트 / 언어 섹션 편집
  - 용도별 템플릿 선택
    - 취업용 이력서, 컨퍼런스 연사 소개, 외주 개발자 소개서, 간략한 개인소개
  - 미리보기에서 이력서 내용을 클립보드에 복사 (복사 버튼)

- **내보내기**
  - PDF (`@react-pdf/renderer`)
  - DOCX (`docx`)
  - PPTX (`pptxgenjs`)
  - HTML / Markdown
  - JSON (구조화된 원본 데이터)

## 기술 스택

| 영역 | 기술 |
| --- | --- |
| 프레임워크 | [Next.js 16](https://nextjs.org) (App Router) |
| 언어 | [TypeScript](https://www.typescriptlang.org) |
| 스타일 | Tailwind CSS 4 |
| 상태 관리 | Zustand |
| 폼 | react-hook-form + Zod |
| PDF 파싱 | pdf-text-extract |
| 웹 스크래핑 | cheerio |
| 자동화 / 세션 | Puppeteer |
| 이력서 생성 | @react-pdf/renderer, docx, pptxgenjs |

## 설치

```bash
# 1. 의존성 설치
npm install

# 2. 개발 서버 실행
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 실행 결과를 확인할 수 있습니다.

> PDF 파싱을 위해 시스템에 `pdftotext`(poppler-utils)가 필요할 수 있습니다.

## 사용 방법

1. **프로필 불러오기** — 내 LinkedIn 프로필 가져오기(로그인) 또는 PDF 파일 업로드로 프로필을 불러옵니다.
2. **편집** — 자동으로 추출된 경력, 학력, 기술, 자격증 등의 내용을 확인하고 수정합니다.
3. **템플릿 선택** — 목적에 맞는 이력서 레이아웃 템플릿(취업용, 연사 소개, 외주 소개서, 개인 소개)을 선택합니다.
4. **내보내기** — PDF, Word, PowerPoint, HTML, Markdown, JSON 중 원하는 형식으로 다운로드하거나, 미리보기에서 텍스트를 복사합니다.

## 프로젝트 구조

```
src/
├── app/
│   ├── api/
│   │   ├── auth/            # LinkedIn 로그인/로그아웃/상태 API (login, logout, status)
│   │   ├── profile/         # 프로필 URL 스크래핑 및 내 프로필 가져오기 (self) API
│   │   ├── upload/          # PDF 업로드 파싱 API
│   │   └── export/          # 형식별 내보내기 API (pdf, docx, pptx, html, markdown, json)
│   ├── layout.tsx
│   └── page.tsx             # 메인 페이지
├── components/
│   ├── editor/              # 프로필 불러오기, 섹션 편집, 세션 버튼, 내보내기 버튼
│   ├── preview/             # 이력서 미리보기 (복사 버튼 포함)
│   └── templates/           # 템플릿 선택기
├── lib/
│   ├── pdf-parser.ts        # LinkedIn PDF → 프로필 데이터 파싱
│   ├── scraper.ts           # LinkedIn HTML 스크래핑
│   ├── parser.ts            # CSV/JSON 내보내기 파일 파싱
│   ├── linkedin-self.ts     # 내 프로필 자동 가져오기 (로그인, PDF 다운로드)
│   ├── linkedin-session.ts  # LinkedIn 세션 저장/삭제
│   ├── templates/           # 용도별 템플릿 정의 (index.ts)
│   ├── store.ts             # Zustand 전역 상태
│   └── exporters/           # 형식별 내보내기 구현
└── types/
    └── index.ts             # 공통 타입 정의
```

> LinkedIn 로그인 세션(쿠키)은 `.linkedin/chrome-profile/`에 저장되며 `.gitignore`에 포함됩니다.

## API 엔드포인트

| 메서드 | 경로 | 설명 |
| --- | --- | --- |
| POST | `/api/upload` | LinkedIn 프로필 PDF 업로드 및 파싱 |
| POST | `/api/profile` | LinkedIn 프로필 URL 스크래핑 |
| POST | `/api/profile/self` | 로그인한 내 프로필 자동 가져오기 |
| POST | `/api/auth/login` | LinkedIn 로그인 (브라우저 세션 인증) |
| POST | `/api/auth/logout` | LinkedIn 세션 로그아웃 |
| GET | `/api/auth/status` | LinkedIn 로그인 세션 상태 확인 |
| POST | `/api/export/pdf` | PDF 내보내기 |
| POST | `/api/export/docx` | DOCX 내보내기 |
| POST | `/api/export/pptx` | PPTX 내보내기 |
| POST | `/api/export/html` | HTML 내보내기 |
| POST | `/api/export/markdown` | Markdown 내보내기 |
| POST | `/api/export/json` | JSON 내보내기 |

## 라이선스

[MIT](./LICENSE)
