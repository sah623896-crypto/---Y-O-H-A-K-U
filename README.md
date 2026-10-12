# 《余白》 YOHAKU — GitHub Pages 홈페이지

**완성형 정적 웹사이트.** 별도 빌드, 서버, 데이터베이스 설치가 필요하지 않습니다.

## 구성

- `index.html` — 매거진형 메인, 세계관, 괴담, 공개 로어북, 토오루 소개 및 전용 프로필 카드, 가족 시안, USER 프로필 제작, 플레이 가이드, 서비스 이미지 갤러리, 공지
- `assets/style.css` — PC / 모바일 반응형 디자인, 포레스트 그린 다크 테마 / 밝은 종이 테마
- `assets/app.js` — 검색, 필터, 펼치기, 복사, USER 설정 초안 작성, 이미지 확대, 테마 전환
- `assets/lore.js` — **일반 L 로어 56개만 수록**. S 비밀 로어와 A 성인 전용 로어는 포함하지 않습니다.
- `assets/cover.webp` — 토오루 공식 표지(메인 첫 화면 및 갤러리)
- `assets/icon.webp` — 토오루 인장(소개 및 전용 프로필 카드)
- `assets/svc1.webp` ~ `assets/svc4.webp` — 네 장의 서비스 이미지(원본 순서 유지)
- `assets/yohaku-main.webp` — 오브제 이미지 01
- `assets/yohaku-mystery.webp` — 사용자 제공 이미지 02
- `assets/yohaku-memory.webp` — 사용자 제공 이미지 03
- `assets/favicon.svg` — 사이트 파비콘

## GitHub Pages 업로드 (새 저장소)

1. GitHub에서 새 **Public** 저장소를 만듭니다. 예: `yohaku-guide`.
2. 압축을 풀어 **`index.html`과 `assets` 폴더가 저장소 최상위에 위치하도록** 업로드합니다. ZIP 파일 자체를 저장소에 올리는 게 아닙니다.
3. 저장소 **Settings → Pages → Build and deployment**에서 `Deploy from a branch`, `main`, `/(root)`를 선택해 저장합니다.
4. 배포 후 주소는 보통 `https://사용자명.github.io/yohaku-guide/` 형태입니다. 실제 주소는 저장소 설정에서 확인하세요.

현재 사이트는 HTTPS 호스팅과 로컬 `index.html` 열기에서 모두 기본 기능을 사용할 수 있습니다. 폰트는 Google Fonts에 접근하지 못할 경우 기기 기본 폰트로 대체됩니다.

## 편집 안내

- **텍스트:** `index.html` 수정.
- **공개 로어:** `assets/lore.js`의 `window.YOHAKU_PUBLIC_LORE` 항목 수정. JSON 형태이므로 따옴표 및 쉼표에 주의.
- **이미지:** `assets` 폴더의 `.webp` 파일을 같은 이름으로 교체. 표지·인장·서비스 4장·오브제 3장으로 구분되어 있고, 기존 파일명을 유지하면 사이트 내 이미지 링크가 유지됩니다. 갤러리 정렬과 확대 보기 순서를 바꾸려면 `index.html`과 `assets/app.js`의 `media` 항목을 함께 변경해야 합니다.
- **색상:** `assets/style.css` 파일 첫 줄의 CSS 변수 변경.
- **가족 설정:** 이름·나이·거주 구성은 **확정되지 않은 제작 시안**이므로 확정 후 `index.html`과 관련 공개 로어를 함께 수정해야 합니다.
- **리핀 링크:** 실제 등록 주소를 확인한 다음 `index.html`의 원하는 위치에 링크를 추가하세요. 현재는 임의의 링크를 넣지 않았습니다.

## 정보 공개 주의

페이지에 포함된 텍스트와 JavaScript는 웹사이트 방문자가 소스 보기로 확인할 수 있습니다. 따라서 제작자 전용 비밀, 확정되지 않은 범인의 정체, 비공개 성인 로어 등을 `assets/lore.js`에 넣지 마세요. 이 버전은 일반 L 로어만 포함합니다. 일부 일반 로어의 과거 정보는 버튼으로 펼쳐서 확인하도록 되어 있지만 보안 수단은 아닙니다.

## 저작권 / 이미지

삽입한 표지 1장, 인장 1장, 서비스컷 4장, 오브제컷 3장은 사용자가 이 대화에서 제공한 이미지를 웹사이트용 WebP로 변환한 것입니다. 원본 PNG는 ZIP에 포함하지 않습니다.
