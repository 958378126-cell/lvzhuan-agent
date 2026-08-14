import "server-only";

export function attachOriginalResume(profile: string, resumeContext?: string) {
  const original = resumeContext?.trim();
  if (!original) return profile.trim();

  return `${profile.trim()}

## 原始简历事实底座（完整原文）
> 以下内容来自用户上传的原始简历，是后续分析和生成的事实依据。AI 可以改写表达，但不得删除、否认或篡改其中的教育、证书、工作、实习和项目经历。

${original}`;
}
