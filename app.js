const USERS = [
  { id: "admin", password: "2026", role: "admin", name: "관리자" },
  { id: "10101", password: "1234", role: "student", studentId: "10101" },
  { id: "10102", password: "1234", role: "student", studentId: "10102" },
  { id: "10103", password: "1234", role: "student", studentId: "10103" },
];

const STUDENTS = [
  {
    id: "10101",
    name: "김코딩",
    photo: "assets/10101_김코딩.jpg",
    grades: {
      "정보 수행평가": "A",
      "웹앱 프로젝트": "92점",
      "디지털 윤리 퀴즈": "88점",
      "수업 참여도": "상",
    },
    traits: [
      "문제 해결 과정을 차분히 설명합니다.",
      "새 도구를 시도할 때 기록을 꼼꼼히 남깁니다.",
      "제출 전 확인 습관을 더 연습하면 좋습니다.",
    ],
    teacherMemo: "프론트엔드 구조 이해가 빠르며, 팀원 질문에 답하는 태도가 좋습니다.",
  },
  {
    id: "10102",
    name: "박개발",
    photo: "assets/10102_박개발.jpg",
    grades: {
      "정보 수행평가": "B+",
      "웹앱 프로젝트": "86점",
      "디지털 윤리 퀴즈": "91점",
      "수업 참여도": "중상",
    },
    traits: [
      "협업 중 역할 분담을 잘 지킵니다.",
      "UI 수정 아이디어를 자주 제안합니다.",
      "프로젝트 범위를 작게 나누는 연습이 필요합니다.",
    ],
    teacherMemo: "기능 구현 의욕이 높고, 오류가 날 때 원인을 함께 추적하려는 태도가 좋습니다.",
  },
  {
    id: "10103",
    name: "이교사",
    photo: "assets/10103_이교사.jpg",
    grades: {
      "정보 수행평가": "A-",
      "웹앱 프로젝트": "89점",
      "디지털 윤리 퀴즈": "95점",
      "수업 참여도": "상",
    },
    traits: [
      "학습 내용을 자기 언어로 정리합니다.",
      "개선할 지점을 발견하면 근거를 함께 제시합니다.",
      "코드 주석을 더 구체적으로 쓰면 좋습니다.",
    ],
    teacherMemo: "질문의 초점이 좋고, 개선 방향을 토의하는 데 적극적입니다.",
  },
];

const loginForm = document.querySelector("#loginForm");
const userIdInput = document.querySelector("#userId");
const passwordInput = document.querySelector("#password");
const loginMessage = document.querySelector("#loginMessage");
const logoutButton = document.querySelector("#logoutButton");
const loginView = document.querySelector("#loginView");
const studentView = document.querySelector("#studentView");
const adminView = document.querySelector("#adminView");

let currentUser = null;

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const id = userIdInput.value.trim();
  const password = passwordInput.value;
  const user = USERS.find((item) => item.id === id && item.password === password);

  if (!user) {
    loginMessage.textContent = "아이디 또는 비밀번호가 올바르지 않습니다.";
    passwordInput.value = "";
    passwordInput.focus();
    return;
  }

  currentUser = user;
  loginMessage.textContent = "";
  loginForm.reset();

  if (user.role === "admin") {
    renderAdminDashboard();
  } else {
    const student = STUDENTS.find((item) => item.id === user.studentId);
    renderStudentPage(student);
  }
});

logoutButton.addEventListener("click", () => {
  currentUser = null;
  showOnly(loginView);
  logoutButton.classList.add("hidden");
  userIdInput.focus();
});

function showOnly(targetView) {
  [loginView, studentView, adminView].forEach((view) => view.classList.add("hidden"));
  targetView.classList.remove("hidden");
}

function renderStudentPage(student) {
  if (!student) {
    loginMessage.textContent = "학생 정보를 찾을 수 없습니다.";
    showOnly(loginView);
    return;
  }

  studentView.innerHTML = `
    <div class="view-header">
      <div class="view-title">
        <p class="eyebrow">Student</p>
        <h2>${student.name} 학생 페이지</h2>
        <p>로그인한 학생의 학습 현황을 확인합니다.</p>
      </div>
    </div>

    <div class="student-layout">
      <article class="student-profile">
        <img class="student-photo" src="${student.photo}" alt="${student.name} 학생 사진" />
        <div class="profile-body">
          <h3>${student.name}</h3>
          <p class="student-number">학번 ${student.id}</p>
          <div class="tag-row" aria-label="학습 키워드">
            <span class="tag">정보</span>
            <span class="tag">프로젝트</span>
          </div>
        </div>
      </article>

      <div class="content-stack">
        ${renderGrades(student.grades, false, `gradesTitle-${student.id}`)}
        ${renderTraits(student)}
      </div>
    </div>
  `;

  showOnly(studentView);
  logoutButton.classList.remove("hidden");
}

function renderAdminDashboard() {
  adminView.innerHTML = `
    <div class="view-header">
      <div class="view-title">
        <p class="eyebrow">Admin</p>
        <h2>관리자 대시보드</h2>
        <p>학생 3명의 학습 현황을 한 화면에서 비교합니다.</p>
      </div>
    </div>

    <section class="admin-grid" aria-label="전체 학생 정보">
      ${STUDENTS.map(renderStudentCard).join("")}
    </section>

    ${renderCounselingPanel()}
  `;

  showOnly(adminView);
  logoutButton.classList.remove("hidden");
  setupCounselingPanel();
}

function renderStudentCard(student, index) {
  return `
    <article class="student-card">
      <img class="student-photo" src="${student.photo}" alt="${student.name} 학생 사진" />
      <div class="student-card-body">
        <h3>${student.name}</h3>
        <p class="student-number">학번 ${student.id}</p>
        ${renderGrades(student.grades, true, `gradesTitle-${student.id}`)}
        ${renderTraits(student)}
        <button class="ghost-button counseling-request" type="button" data-index="${index}">
          상담 전략 요청
        </button>
      </div>
    </article>
  `;
}

function renderGrades(grades, compact = false, headingId = "gradesTitle") {
  const rows = Object.entries(grades)
    .map(([label, value]) => `<tr><th scope="row">${label}</th><td>${value}</td></tr>`)
    .join("");

  return `
    <section aria-labelledby="${headingId}">
      <div class="section-title">
        <h3 id="${headingId}">성적 정보</h3>
      </div>
      <table class="grade-table ${compact ? "compact-table" : ""}">
        <tbody>${rows}</tbody>
      </table>
    </section>
  `;
}

function renderTraits(student) {
  return `
    <section aria-labelledby="traitsTitle-${student.id}">
      <div class="section-title">
        <h3 id="traitsTitle-${student.id}">학습 특성 및 교사 메모</h3>
      </div>
      <ul class="memo-list">
        ${student.traits.map((trait) => `<li>${trait}</li>`).join("")}
        <li>${student.teacherMemo}</li>
      </ul>
    </section>
  `;
}

// ===== AI 학생 상담 전략 도우미 =====
//
// [보안 점검 주석]
// 1. 프론트엔드에 Gemini API 키를 넣으면 개발자 도구에서 노출될 수 있으므로 절대 넣지 않는다.
// 2. Gemini API 호출은 /api/gemini-counseling Vercel Serverless Function에서만 처리한다.
// 3. .env 파일은 GitHub에 올리지 않는다. (.gitignore 등록)
// 4. Vercel 배포 시 Project Settings의 Environment Variables에 GEMINI_API_KEY를 등록해야 한다.
// 5. Gemini로 전송하는 데이터는 이름, 학번, 사진 경로, 비밀번호를 제외한 최소 정보로 제한한다.

const STUDENT_ALIASES = ["학생 A", "학생 B", "학생 C", "학생 D", "학생 E"];

// 현재 상담 패널에서 선택된 학생 인덱스 (없으면 null)
let selectedCounselingIndex = null;

// 학생 데이터를 익명화하여 Gemini 전송용 데이터만 만든다.
// 이름, 학번, 사진 경로, 비밀번호, 원본 전체 데이터는 포함하지 않는다.
function buildAnonymizedPayload(index, concern) {
  const student = STUDENTS[index];
  const gradeSummary = Object.entries(student.grades)
    .map(([label, value]) => `${label} ${value}`)
    .join(", ");
  const learningTraits = student.traits.join(" ");

  return {
    studentAlias: STUDENT_ALIASES[index] || `학생 ${index + 1}`,
    gradeSummary,
    learningTraits,
    teacherConcern: concern,
  };
}

const COUNSELING_PLACEHOLDER =
  "예) 수업 참여는 좋은데 평가 결과가 낮습니다. 어떻게 상담하면 좋을까요?\n" +
  "예) 과제 제출이 자주 늦습니다. 혼내기보다는 원인을 파악하고 싶은데 어떻게 접근하면 좋을까요?\n" +
  "예) 친구들과 협업할 때 소극적인 편입니다. 어떤 질문으로 대화를 시작하면 좋을까요?";

function renderCounselingPanel() {
  return `
    <section class="counseling-panel" aria-labelledby="counselingTitle">
      <div class="section-title">
        <h3 id="counselingTitle">AI 학생 상담 전략 도우미</h3>
      </div>
      <p class="counseling-guide">
        위 학생 카드의 “상담 전략 요청” 버튼으로 학생을 선택하고 상담 고민을 입력하면,
        AI가 익명화된 학생 데이터를 바탕으로 상담 전략을 제안합니다.
      </p>

      <div class="counseling-selected" id="counselingSelected">
        <p class="counseling-empty">아직 선택된 학생이 없습니다. “상담 전략 요청” 버튼을 눌러주세요.</p>
      </div>

      <label class="counseling-label" for="teacherConcern">상담 고민</label>
      <textarea
        id="teacherConcern"
        class="counseling-textarea"
        rows="4"
        placeholder="${COUNSELING_PLACEHOLDER}"
      ></textarea>

      <div class="counseling-preview">
        <p class="counseling-label">전송 데이터 미리보기 (Gemini로 전송되는 익명화 데이터)</p>
        <pre id="counselingPreview" class="counseling-preview-box">학생을 선택하면 전송 데이터가 표시됩니다.</pre>
      </div>

      <button id="counselingSubmit" class="primary-button" type="button">AI 상담 전략 받기</button>

      <p id="counselingError" class="form-message" role="alert" aria-live="polite"></p>

      <div id="counselingResult" class="counseling-result hidden" aria-live="polite"></div>

      <p class="counseling-disclaimer">
        AI 상담 전략은 참고용입니다. 최종 판단과 실제 상담은 교사가 학생의 상황을 종합적으로 고려하여 진행해야 합니다.
      </p>
    </section>
  `;
}

function setupCounselingPanel() {
  const selectedArea = document.querySelector("#counselingSelected");
  const concernInput = document.querySelector("#teacherConcern");
  const previewBox = document.querySelector("#counselingPreview");
  const submitButton = document.querySelector("#counselingSubmit");
  const errorBox = document.querySelector("#counselingError");
  const resultBox = document.querySelector("#counselingResult");

  selectedCounselingIndex = null;

  function updatePreview() {
    if (selectedCounselingIndex === null) {
      previewBox.textContent = "학생을 선택하면 전송 데이터가 표시됩니다.";
      return;
    }
    const payload = buildAnonymizedPayload(selectedCounselingIndex, concernInput.value.trim());
    previewBox.textContent = JSON.stringify(payload, null, 2);
  }

  function selectStudent(index) {
    selectedCounselingIndex = index;
    const student = STUDENTS[index];
    const alias = STUDENT_ALIASES[index] || `학생 ${index + 1}`;

    // 화면용 정보(이름·학번)와 Gemini 전송용 익명화 정보(별칭)를 구분해서 표시한다.
    selectedArea.innerHTML = `
      <div class="counseling-selected-row">
        <span class="counseling-tag display">화면 표시용</span>
        <span>${student.name} · 학번 ${student.id}</span>
      </div>
      <div class="counseling-selected-row">
        <span class="counseling-tag anon">Gemini 전송용(익명화)</span>
        <span>${alias}</span>
      </div>
    `;

    errorBox.textContent = "";
    resultBox.classList.add("hidden");
    resultBox.textContent = "";
    updatePreview();
    concernInput.focus();
  }

  document.querySelectorAll(".counseling-request").forEach((button) => {
    button.addEventListener("click", () => {
      selectStudent(Number(button.dataset.index));
    });
  });

  concernInput.addEventListener("input", updatePreview);

  submitButton.addEventListener("click", async () => {
    errorBox.textContent = "";

    if (selectedCounselingIndex === null) {
      errorBox.textContent = "먼저 학생을 선택해주세요.";
      return;
    }

    const concern = concernInput.value.trim();
    if (!concern) {
      errorBox.textContent = "상담 고민을 먼저 입력해주세요.";
      concernInput.focus();
      return;
    }

    const payload = buildAnonymizedPayload(selectedCounselingIndex, concern);

    submitButton.disabled = true;
    resultBox.classList.remove("hidden");
    resultBox.textContent = "AI가 상담 전략을 생성하는 중입니다.";

    try {
      // 프론트엔드는 Gemini API를 직접 호출하지 않고, 서버리스 함수로만 POST 요청을 보낸다.
      const response = await fetch("/api/gemini-counseling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data && data.error ? data.error : "요청 실패");
      }

      resultBox.textContent = data.result;
    } catch (error) {
      resultBox.classList.add("hidden");
      resultBox.textContent = "";
      errorBox.textContent =
        "AI 상담 전략을 불러오지 못했습니다. API 키 또는 Vercel 환경 변수를 확인해주세요.";
    } finally {
      submitButton.disabled = false;
    }
  });

  updatePreview();
}

showOnly(loginView);
