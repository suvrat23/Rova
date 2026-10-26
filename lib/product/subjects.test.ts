import { describe, expect, it } from "vitest";
import { allTopics, choiceIndex, gradeAnswer, gradeChoice, questions, subjects, topicsFor, topics } from "./curriculum";
import { extraQuestions, extraTopics } from "./subjects";
import { sampleWorkspace, upgradeSampleWorkspace } from "./model";
import { classStatuses, studentStatus, topicStatusCounts } from "./progress";
import { advanceCoaching, coachingTurn, startCoaching } from "./coaching";
import { progressReport } from "./report";
import { familyActivities, supportTopics } from "./insights";
import { validateDraft } from "./bank";

describe("subjects beyond mathematics", () => {
  it("gives every subject three topics with three multiple-choice questions each", () => {
    for (const subject of subjects.filter(s => s.id !== "math")) {
      const list = topicsFor(subject.id);
      expect(list, subject.id).toHaveLength(3);
      for (const topic of list) {
        const set = questions.filter(q => q.topic === topic.id);
        expect(set, topic.id).toHaveLength(3);
        for (const q of set) {
          expect(q.choices, q.id).toHaveLength(4);
          expect(q.choices).toContain(q.answer);
          expect(new Set(q.choices).size).toBe(4);
          expect(q.hints).toHaveLength(3);
          expect(q.simple.length).toBeGreaterThan(20);
        }
      }
    }
    expect(topicsFor("math")).toBe(topics);
    expect(allTopics).toHaveLength(6 + extraTopics.length + 1);
    expect(new Set(questions.map(q => q.id)).size).toBe(questions.length);
  });
  it("does not always put the answer first", () => {
    const positions = new Set(extraQuestions.map(q => q.choices!.indexOf(q.answer)));
    expect(positions.size).toBe(4);
  });
  it("grades a choice by letter, number, or text, and never by a wrong one", () => {
    const q = questions.find(item => item.id === "scm1")!;
    const right = q.choices!.indexOf(q.answer);
    const wrong = (right + 1) % 4;
    expect(gradeChoice(q, "abcd"[right])).toBe(true);
    expect(gradeChoice(q, "ABCD"[right] + ".")).toBe(true);
    expect(gradeChoice(q, String(right + 1))).toBe(true);
    expect(gradeChoice(q, q.answer.toUpperCase())).toBe(true);
    expect(gradeChoice(q, "abcd"[wrong])).toBe(false);
    expect(gradeChoice(q, "steam is a gas")).toBe(false);
    expect(choiceIndex(q, "e")).toBe(-1);
    expect(gradeAnswer("scm1", q.answer)).toBe(true);
    expect(gradeAnswer("fr1", "2")).toBe(true);
  });
  it("coaches a science lesson: a letter answers, a question gets a clue, and wrong picks retry", () => {
    const workspace = sampleWorkspace();
    const at = "2026-10-25T09:00:00.000Z";
    const session = startCoaching(workspace, "maya", "sci-matter", "s-sci", at);
    const q = questions.find(item => item.id === session.messages[0].questionId)!;
    expect(session.messages[0].text).toMatch(/Pick a choice/);
    coachingTurn(workspace, "maya", session.id, "t1", "Show me a picture", at);
    expect(session.messages.at(-1)?.kind).toBe("hint");
    expect(session.messages.at(-1)?.text).toMatch(/^No picture for this one/);
    const wrong = "abcd"[(q.choices!.indexOf(q.answer) + 1) % 4];
    coachingTurn(workspace, "maya", session.id, "t2", wrong, at);
    expect(session.messages.at(-1)?.kind).toBe("retry");
    expect(workspace.attempts.at(-1)).toMatchObject({ questionId: q.id, correct: false, topic: "sci-matter" });
    coachingTurn(workspace, "maya", session.id, "t3", `I think it's ${"ABCD"[q.choices!.indexOf(q.answer)]}`, at);
    expect(session.messages.at(-1)?.kind).toBe("correct");
    advanceCoaching(workspace, "maya", session.id, at);
    expect(session.questionIndex).toBe(1);
  });
  it("seeds a starting profile for every subject and upgrades older saved classrooms", () => {
    const workspace = sampleWorkspace();
    for (const s of workspace.students) for (const t of allTopics.filter(t => t.id !== "ratios")) expect(s.scores[t.id], `${s.id} ${t.id}`).toBeGreaterThan(0);
    const old = sampleWorkspace();
    for (const s of old.students) for (const t of extraTopics) delete s.scores[t.id];
    upgradeSampleWorkspace(old);
    expect(old.students[3].scores["sci-matter"]).toBe(workspace.students[3].scores["sci-matter"]);
  });
  it("computes statuses, the report, and family activities per subject", () => {
    const workspace = sampleWorkspace();
    const science = classStatuses(workspace, new Date(), "science");
    expect(science).toHaveLength(18);
    expect(science.every(s => s.topics.length === 3 && s.topics.every(t => t.topic.startsWith("sci-")))).toBe(true);
    expect(topicStatusCounts(workspace, new Date(), "ela").map(t => t.topic.id)).toEqual(["ela-words", "ela-story", "ela-info"]);
    const maya = workspace.students[0];
    expect(studentStatus(maya, workspace, new Date(), "spanish").topics.map(t => t.topic)).toEqual(["sp-greetings", "sp-numbers", "sp-family"]);
    const report = progressReport(workspace, "health");
    expect(report.topicConfidence.map(t => t.topic)).toEqual(["Healthy eating & activity", "Safety & first steps", "Feelings & wellness"]);
    expect(supportTopics(workspace.students[17], workspace, "social-studies")).toHaveLength(3);
    expect(familyActivities(workspace, "alex", maya, "science").next?.id).toMatch(/^sci-/);
    expect(familyActivities(workspace, "alex", maya).next?.id).toBe("fractions");
  });
  it("validates teacher-written multiple-choice questions", () => {
    const base = { topic: "sci-energy" as const, prompt: "Which of these is an insulator?", hints: ["Think about what blocks electricity."], explanation: "", guide: "", simple: "" };
    expect(validateDraft({ ...base, answer: "Rubber", choices: ["Rubber", "Copper", "Iron"] })).toBeNull();
    expect(validateDraft({ ...base, answer: "Gold", choices: ["Rubber", "Copper", "Iron"] })).toMatch(/answer/i);
    expect(validateDraft({ ...base, answer: "Rubber", choices: ["Rubber"] })).toMatch(/2 to 4/);
    expect(validateDraft({ ...base, answer: "Rubber", choices: ["Rubber", "rubber"] })).toMatch(/different/);
    expect(validateDraft({ ...base, answer: "Rubber" })).toMatch(/number/);
  });
});
