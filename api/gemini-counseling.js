// AI 학생 상담 전략 도우미 - Vercel Serverless Function
//
// [보안 점검 주석]
// 1. 프론트엔드(app.js)에 API 키를 넣으면 브라우저 개발자 도구(Network/Sources)에서
//    그대로 노출될 수 있으므로 절대 넣지 않는다.
// 2. Gemini API 호출은 반드시 이 Vercel Serverless Function에서만 처리한다.
// 3. API 키는 `.env` 파일(로컬) 또는 Vercel 환경 변수로만 관리하며 GitHub에 올리지 않는다.
// 4. Vercel 배포 시 Project Settings > Environment Variables 에 `GEMINI_API_KEY`를 등록해야 한다.
// 5. Gemini로 전송하는 데이터는 학생 이름, 학번, 사진 경로, 비밀번호를 제외한 최소 정보로 제한한다.
//
// 이 코드 안에도 API 키 문자열을 직접 적지 않는다. (process.env에서만 읽는다.)

const GEMINI_MODEL = "gemini-3.1-flash-lite";
const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/" +
  GEMINI_MODEL +
  ":generateContent";

// Gemini가 학생을 단정적으로 판단/진단하지 않고, 교사를 돕는 방향으로 응답하도록 안내하는 시스템 프롬프트.
const SYSTEM_PROMPT = `당신은 교사를 돕는 학생 상담 전략 어시스턴트입니다.
주어진 익명화된 학생 정보와 교사의 상담 고민을 바탕으로, 교사가 학생을 이해하고 대화를 시작할 수 있도록 돕는 상담 전략을 제안하세요.

응답 원칙:
- 학생을 단정적으로 판단하거나 진단하지 마세요.
- "의지가 부족하다", "주의력 문제가 있다", "심리적 문제가 있다" 와 같이 단정하는 표현을 사용하지 마세요.
- 교사가 학생을 이해하고 대화할 수 있도록 돕는 방향으로 응답하세요.
- 제안하는 상담 전략은 참고용이며, 최종 판단과 실제 상담은 교사가 한다는 점을 응답에 자연스럽게 포함하세요.

반드시 아래 6개 항목 형식을 그대로 사용하여 한국어로 응답하세요.
1. 현재 상황 요약
2. 학생 데이터 기반 해석
3. 상담 접근 전략
4. 교사가 던질 수 있는 질문 3개
5. 피해야 할 말 또는 주의점
6. 다음 수업에서 해볼 수 있는 작은 지원`;

function buildUserPrompt({ studentAlias, gradeSummary, learningTraits, teacherConcern }) {
  return [
    "다음은 익명화된 학생 정보와 교사의 상담 고민입니다.",
    "",
    `- 학생: ${studentAlias}`,
    `- 성적 요약: ${gradeSummary}`,
    `- 학습 특성: ${learningTraits}`,
    `- 교사의 상담 고민: ${teacherConcern}`,
  ].join("\n");
}

export default async function handler(req, res) {
  // POST 요청만 허용한다.
  if (req.method !== "POST") {
    res.status(405).json({ success: false, error: "POST 요청만 허용됩니다." });
    return;
  }

  // Vercel은 application/json 요청 body를 자동 파싱하지만, 문자열로 들어오는 경우도 방어한다.
  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (error) {
      res.status(400).json({ success: false, error: "요청 본문(JSON)을 해석할 수 없습니다." });
      return;
    }
  }
  body = body || {};

  const { studentAlias, gradeSummary, learningTraits, teacherConcern } = body;

  // 필수 값 검증.
  if (!studentAlias || !gradeSummary || !learningTraits || !teacherConcern) {
    res.status(400).json({
      success: false,
      error: "studentAlias, gradeSummary, learningTraits, teacherConcern 값이 모두 필요합니다.",
    });
    return;
  }

  // 환경 변수에서만 API 키를 읽는다. 코드에 키를 직접 적지 않는다.
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      success: false,
      error: "GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.",
    });
    return;
  }

  const requestBody = {
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPT }],
    },
    contents: [
      {
        role: "user",
        parts: [
          {
            text: buildUserPrompt({ studentAlias, gradeSummary, learningTraits, teacherConcern }),
          },
        ],
      },
    ],
  };

  try {
    // Node.js 내장 fetch 사용 (외부 SDK/패키지 없음).
    const geminiResponse = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const data = await geminiResponse.json();

    if (!geminiResponse.ok) {
      const message =
        (data && data.error && data.error.message) || "Gemini API 호출에 실패했습니다.";
      res.status(502).json({ success: false, error: message });
      return;
    }

    // 응답에서 텍스트 파트만 추출하여 합친다.
    const parts =
      (data &&
        data.candidates &&
        data.candidates[0] &&
        data.candidates[0].content &&
        data.candidates[0].content.parts) ||
      [];
    const result = parts
      .map((part) => (part && part.text ? part.text : ""))
      .join("")
      .trim();

    if (!result) {
      res.status(502).json({ success: false, error: "Gemini 응답이 비어 있습니다." });
      return;
    }

    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Gemini API 호출 중 오류가 발생했습니다.",
    });
  }
}
